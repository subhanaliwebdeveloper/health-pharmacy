import React from "react";
import {Link} from 'react-router-dom';export default function NotFound(){return <div className="empty page"><h1>404</h1><p>Page not found.</p><Link className="btn-primary" to="/">Go Home</Link></div>}
