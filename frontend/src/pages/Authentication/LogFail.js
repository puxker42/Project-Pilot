import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdError } from 'react-icons/md';
import './loginFailed.css';

function LoginFailed() {
  const navigate = useNavigate();
  const location = useLocation();
  const errorMessage = location.state?.error || location.state?.message || "Oops! The credentials you entered are incorrect.";

  return (
    <div className='login-failed-container'>
      <motion.div
        className='login-failed-box'
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ rotate: [0, 10, -10, 0] }}
          transition={{
            duration: 0.5,
            ease: "backOut"
          }}
        >
          <MdError className='login-failed-icon' />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Login Failed
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {errorMessage}
        </motion.p>

        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Go Back to Login
        </motion.button>
      </motion.div>
    </div>
  );
}

export default LoginFailed;
