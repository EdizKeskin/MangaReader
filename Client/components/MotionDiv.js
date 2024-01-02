"use client";

import { motion } from "framer-motion";

export default function MotionDiv({ children, i }) {
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const stagger = 0.1;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{
        delay: i * stagger,
        ease: "easeInOut",
        duration: 0.5,
      }}
      viewport={{ amount: 0 }}
    >
      {children}
    </motion.div>
  );
}
