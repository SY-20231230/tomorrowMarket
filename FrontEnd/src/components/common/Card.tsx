import React from "react";
import "./Card.css";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function Card({ children, className = "", style }: CardProps) {
  return <div className={`card ${className}`} style={style}>{children}</div>;
}

export default Card;