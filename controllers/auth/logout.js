/**
 * Logs the user out by clearing the refresh token cookie.
 */
const logout = (req, res) => {
    //  Clear the cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });
  
    return res.status(200).json({ message: 'Logged out successfully.' });
  };
  
  export default logout;
  