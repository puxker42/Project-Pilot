import React, { useState } from 'react';
import logo from '../../images/logo.png';
import { useNavigate } from 'react-router-dom';
import './DeveloperLogin.css'; // New Dark Mode CSS

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function DeveloperLogin() {
    const [userID, setuserID] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const bodyData = JSON.stringify({ userID, password });

            const res = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: bodyData,
            });

            const data = await res.json();

            if (res.ok) {
                if (data.user.role !== 'Developer') {
                    alert("Access Denied: This portal is for Developers only.");
                    setIsLoading(false);
                    return;
                }

                localStorage.setItem('token', data.token);
                const tokenParam = `?token=${encodeURIComponent(data.token)}`;
                localStorage.setItem('user', JSON.stringify(data.user));

                navigate(`/developer-dashboard${tokenParam}`);
                localStorage.setItem('homePath', `/developer-dashboard${tokenParam}`);
            } else {
                console.log('Login failed:', data);
                alert("Login Failed");
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Something went wrong. Please try again!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container developer-mode">
            <div className="login-card developer-mode">
                <div className="left-section developer-mode">
                    <div className="logo-container">
                        <img src={logo} alt="Logo" className="college-logo" width="100" height="100" />
                    </div>
                    <h1 className="college-name developer-mode">Project Pilot<br />Core System</h1>
                    <div className="department-info">
                        <p className="department-name developer-mode">Restricted Access</p>
                        <p className="tool-name developer-mode">Developer Console</p>
                    </div>
                </div>

                <div className="right-section developer-mode">
                    <h2 className="form-title developer-mode">System Override</h2>
                    <p className="form-subtitle developer-mode">Identify yourself</p>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group developer-mode">
                            <label className="input-label developer-mode">System ID</label>
                            <input
                                type="text"
                                value={userID}
                                onChange={(e) => setuserID(e.target.value)}
                                className="form-input developer-mode"
                                placeholder="ID"
                                required
                            />
                        </div>

                        <div className="input-group developer-mode">
                            <label className="input-label developer-mode">Passkey</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input developer-mode"
                                placeholder="Passkey"
                                required
                            />
                        </div>

                        <div className="button-container">
                            <button
                                type="submit"
                                className="login-button developer-mode"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Authenticating...' : 'Access Core'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default DeveloperLogin;
