import { Container, TextInput, Button, Space, Text } from '@mantine/core';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import config from '../config';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.api.baseUrl}${config.api.endpoints.login}`, {
        username,
        password,
      });

      const { token } = response.data;

      // Save token to localStorage (or cookies if preferred)
      localStorage.setItem('jwt_token', token);

      notifications.show({
        title: 'Login Successful',
        message: 'You are now logged in!',
        color: 'green',
        position: 'bottom-right',
      });

      navigate('/');
    } catch (error: any) {
      notifications.show({
        title: 'Login Failed',
        message: error.response?.data?.message || 'Invalid credentials',
        color: 'red',
        position: 'bottom-right',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs">
      <Space h="xl" />
      <Text size="lg" weight={500}>Login to plan your trip</Text>
      <Space h="md" />

      <TextInput
        label="Username"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
        required
      />

      <Space h="sm" />

      <TextInput
        label="Password"
        placeholder="Enter password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        required
      />

      <Space h="lg" />

      <Button fullWidth onClick={handleLogin} loading={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </Container>
  );
}