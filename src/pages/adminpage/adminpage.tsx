import { Box, Button } from '@mui/material';
import { useDebounce } from '../../utils/hooks';
import React from 'react';

type Book = {
  _id: string;
  title: string;
  date: string;
  _v: number;
};

const NewPoll = React.memo(({ pollList, deleteHandler, setNewPollList }: { pollList: Pick<Book, '_id' | 'title'>[], deleteHandler: (id: string) => void, setNewPollList: React.Dispatch<React.SetStateAction<Pick<Book, '_id' | 'title'>[]>> }) => {
  const [activePoll, setActivePoll] = React.useState(false);


  const handleSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        await fetch('/api/new_poll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options: pollList, active_poll: activePoll }),
      });

      setNewPollList([]);
      setActivePoll(false);
    } catch (error) {
      console.log(error);
    }
  }, [activePoll, pollList, setNewPollList]);
  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        borderRadius: '20px',
        backgroundColor: '#fff',
        padding: '3rem',
        maxWidth: '500px',
        height: "500px",
        overflow: 'scroll'
      }}
      component="form"
      onSubmit={handleSubmit}
    >
      {pollList.map((poll) => (
        <Box sx={{
          padding: '1rem',
          border: '2px solid #f0f0f0',
          borderRadius: '5px',
          marginBottom: '1rem',
          cursor: 'pointer',
          '&:hover': { border: '2px solid #6766ee', transition: 'border 0.5s ease-in-out' },
        }} key={poll._id} onClick={() => deleteHandler(poll._id)}><p key={poll._id}>{poll.title}</p></Box>
      ))}
      <Box>
        <label>
          <input
            type="checkbox"
            name="active_poll"
            onChange={(e) => setActivePoll(e.target.checked)}
          />
          Активный опрос
        </label>
      </Box>
      <Button type="submit" sx={{ margin: 'auto auto auto 0' }}>Создать опрос</Button>
    </Box>
  );
});

const AdminPage = () => {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [book, setBook] = React.useState('');
  const { debouncedValue, pending } = useDebounce(book, 500);
  const [newPollList, setNewPollList] = React.useState<Pick<Book, '_id' | 'title'>[]>([]);
  const [creds, setCreds] = React.useState({ username: localStorage.getItem('username') || '', password: localStorage.getItem('password') || '' });
  const getBooks = async () => {
    try {
      const res = await fetch('/api/books');
      setBooks(await res.json());
    } catch (error) {
      console.log(error);
    }
  };

  const logOut = React.useCallback(() => {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    setCreds({ username: '', password: '' });
  }, []);


  const handleBooks = React.useCallback((book: Pick<Book, '_id' | 'title'>) => {
    setNewPollList([...newPollList, book]);
  }, [newPollList]);

  const handleDeleteBook = React.useCallback((id: string) => {
    setNewPollList(newPollList.filter((b) => b._id !== id));
  }, [newPollList]);


  React.useEffect(() => {
    getBooks();
  }, []);

  const loginHandler = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    setCreds({ username, password });
    console.log(creds)
  }, [creds]);

  return (
    <div className="container">
      <Box sx={{ display: 'flex', gap: '1rem', minHeight: '100vh', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
       <p onClick={logOut} className='link'>Выйти</p>
      {creds.username === 'admin' && creds.password === 'admin' ? (<Box sx={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            borderRadius: '20px',
            backgroundColor: '#fff',
            padding: '3rem',
            maxWidth: '500px',
            height: "500px",
            overflow: 'scroll'
          }}
        >
          <input type="text" value={book} onChange={(e) => setBook(e.target.value)} placeholder='Поиск'/>
          {pending ? <p>Ищем...</p> : (
            books.filter((b) => b.title.toLowerCase().includes(debouncedValue.toLowerCase())).filter((book) => !newPollList.some((b) => b._id === book._id)).map((book) => (
              
              <Box sx={{
                padding: '1rem',
                border: '2px solid #f0f0f0',
                borderRadius: '5px',
                marginBottom: '1rem',
                cursor: 'pointer',
                '&:hover': { border: '2px solid #6766ee', transition: 'border 0.5s ease-in-out' },
              }}
                onClick={() => handleBooks(book)}
                key={book._id}
              >
                <p >
                  {book.title}
                </p>
              </Box>
            ))

          )}
        </Box>
        <NewPoll pollList={newPollList} deleteHandler={handleDeleteBook} setNewPollList={setNewPollList}/>
      </Box>) : (
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '1rem',
            borderRadius: '20px',
            backgroundColor: '#fff',
            padding: '3rem',
            maxWidth: '500px',
            height: "500px",
            overflow: 'scroll'
          }}
        >
          <form onSubmit={loginHandler}>
            <input type="text" placeholder='Логин' name='username' />
            <input type="password" placeholder='Пароль' name='password' />
            <button type="submit">Войти</button>
          </form>
        </Box>
      )}
      </Box>
    </div>
  );
};

export default AdminPage;
