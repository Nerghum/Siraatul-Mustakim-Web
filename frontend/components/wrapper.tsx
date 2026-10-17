import type React from "react";
import styles from "@/styles/wrapper.module.css";

interface WrapperProps {
  children: React.ReactNode;
  className?: string;
}

const Wrapper = ({ children, className = "" }: WrapperProps) => {
  return <div className={`${styles.wrapper} ${className}`}>{children}</div>;
};

export default Wrapper;
