import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue to your account"
      linkText="Don't have an account? Sign up"
      linkTo="/register"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
