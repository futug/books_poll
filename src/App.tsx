import { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';
import Button from '@mui/material/Button';
import { FormControlLabel, FormGroup, Checkbox, Box, Typography } from '@mui/material';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { Link } from 'react-router-dom';

type Poll = {
  active_poll: boolean;
  _id: string;
  options: {
    _id: string;
    title: string;
    votes: number;
    percentage: string;
  }[];
  __v: number;
  date: string;
};

type PollStats = {
  count: number;
  optionId: string;
  percentage: string;
  title: string;
};

function App() {
  const pollRef = useRef<Poll | null>(null);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [chosenOptions, setChosenOptions] = useState<string[]>([]);
  const [pollStats, setPollStats] = useState<PollStats[]>([]);
  const [mergedPoll, setMergedPoll] = useState<Poll | null>(null);
  const disabled = chosenOptions.length === 3 || localStorage.getItem('alreadyVoted') === poll?._id;

  const mergeResponse = (poll: Poll | null, pollStats: PollStats[]) => {
    if (!poll) return null;
    const mergedPoll = { ...poll, options: poll.options.map((option) => ({ ...option, votes: 0, percentage: '' })) };
    pollStats.forEach((stat) => {
      const optionIndex = mergedPoll.options.findIndex((option) => option._id === stat.optionId);
      if (optionIndex !== -1) {
        mergedPoll.options[optionIndex].votes = stat.count;
        mergedPoll.options[optionIndex].percentage = stat.percentage;
      }
    });
    return mergedPoll;
  };

  const getPoll = useCallback(async () => {
    try {
      const res = await fetch('https://bookpoll.vercel.app/api/polls');
      const data = await res.json();
      pollRef.current = data[data.length - 1];
      setPoll(data[data.length - 1]);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getStats = useCallback(async () => {
    if (!poll?._id) return;
    try {
      const statRes = await fetch(`https://bookpoll.vercel.app/api/polls/${poll._id}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const statData = await statRes.json();
      setPollStats(statData);
    } catch (error) {
      console.log(error);
    }
  }, [poll?._id]);

  useEffect(() => {
    getPoll();
  }, [getPoll]);

  useEffect(() => {
    if (poll?._id) {
      getStats();
    }
  }, [poll?._id, getStats]);
  
  useEffect(() => {
    const merged = mergeResponse(poll, pollStats);
    if (merged) {
      setMergedPoll(merged);
    }
  }, [poll, pollStats]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChosenOptions((prevChosenOptions) =>
      e.target.checked
        ? [...prevChosenOptions, value]
        : prevChosenOptions.filter((option) => option !== value)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chosenOptions.length === 0) return alert('Выберите хотя бы один вариант');
    const form = e.target as HTMLFormElement;
    try {
      await fetch('https://bookpoll.vercel.app/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pollId: poll?._id, optionIds: chosenOptions }),
      });
      getStats();
      setChosenOptions([]);
      if (poll?._id) {
        localStorage.setItem('alreadyVoted', poll?._id);
      }
      form.reset();
    } catch (error) {
      console.log(error);
    }
  };



  const handleBoxClick = (optionId: string) => {
    setChosenOptions((prevChosenOptions) =>
      prevChosenOptions.includes(optionId)
        ? prevChosenOptions.filter((option) => option !== optionId)
        : [...prevChosenOptions, optionId]
    );
  };

  return (
    <>
      <div className="container">
        <div className="wrapper">
          <Link to="/admin" className='link'>Админка</Link>
          <form onSubmit={handleSubmit} className="form">
            Выбираем книгу
            {localStorage.getItem('alreadyVoted') === poll?._id && <p>Вы уже проголосовали</p>}
            {disabled && localStorage.getItem('alreadyVoted') !== poll?._id && <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><p>Вы можете выбрать только три варианта ответа</p> <Button type="button" variant="text" onClick={() => setChosenOptions([])}>Сбросить</Button></Box>}
            <FormGroup>
              {mergedPoll?.options.map((option) => (
                <Box
                  key={option._id}
                  sx={{
                    padding: '1rem',
                    border: '2px solid #f0f0f0',
                    borderRadius: '5px',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                    '&:hover': { border: '2px solid #6766ee', transition: 'border 0.5s ease-in-out' },
                  }}
                  onClick={() => handleBoxClick(option._id)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{ '&.Mui-checked': { color: '#6766ee' } }}
                          checked={chosenOptions.includes(option._id)}
                          value={option._id}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label={option.title}
                      disabled={disabled}
                    />
                    <Typography component="p">{option.percentage ? `${option.percentage}%` : '0%'}</Typography>
                  </Box>
                  <LinearProgress
                    sx={{
                      backgroundColor: '#f0f0f0',
                      [`& .${linearProgressClasses.bar}`]: {
                        backgroundColor: '#6766ee',
                      },
                    }}
                    variant="determinate"
                    value={parseInt(option.percentage)}
                  />
                </Box>
              ))}
            </FormGroup>
            <Button
              variant="contained"
              type="submit"
              sx={{ backgroundColor: '#6664ee', '&:hover': { backgroundColor: '#6664ee' } }}
              disabled={localStorage.getItem('alreadyVoted') === poll?._id}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
