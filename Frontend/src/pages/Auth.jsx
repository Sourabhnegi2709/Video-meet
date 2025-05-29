import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { signup, login } from '../services/api'; // import your API functions
import { useNavigate } from "react-router-dom";



const AuthForm = () => {
  const [formState, setFormState] = useState(0);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '',
    name: '',
    password: '',
  });

  
  const navigate = useNavigate();


  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formState === 0) {
        const res = await signup(form);
        setMessage('Signup successful!');
       

        // Save token and user if available (adjust keys if your API differs)
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('userId', res.data.user._id);
        }
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        setForm({ username: '', name: '', password: '' }); // reset form
        navigate('/home'); // redirect to home after signup
      } else {
        const res = await login({ name: form.name, password: form.password });
        
        setMessage('Login successful!');
        

        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        setForm({ name: '', password: '' }); // reset form
        navigate('/home'); // redirect to home after login
      }
    } catch (err) {
      console.error('Auth error:', err.response?.data || err.message);
      setMessage('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Box className="flex items-center justify-center h-[calc(100vh-4.5rem)]">
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3, width: 350 }}>
        <div className='flex items-center justify-center mb-3'>
          <Button
            variant={formState === 0 ? 'contained' : ''}
            onClick={() => setFormState(0)}
          >
            Sign In
          </Button>
          <Button
            variant={formState === 1 ? 'contained' : ''}
            onClick={() => setFormState(1)}
          >
            Log In
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          {formState === 0 ? (
            <TextField
              fullWidth
              label="Full name"
              name="username"
              value={form.username}
              onChange={handleChange}
              variant="outlined"
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
          ) : (
            ''
          )}

          <TextField
            fullWidth
            label="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            variant="outlined"
            required
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
          >
            {formState === 0 ? 'Sign Up' : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AuthForm;
