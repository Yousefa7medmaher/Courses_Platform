import jwt from 'jsonwebtoken';

const refresh = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ message: 'Refresh token not provided' });

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

    return res.status(200).json({ accessToken: newAccessToken });
  });
};

export default refresh;