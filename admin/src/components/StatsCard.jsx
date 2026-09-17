import React from "react";
export default function StatsCard({title,value,icon,note}){return <div className="stat"><span className="stat-icon">{icon}</span><div><small>{title}</small><h2>{value}</h2>{note&&<p>{note}</p>}</div></div>}
