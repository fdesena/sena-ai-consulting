import { useEffect, useState } from "react";

const phrases = [
  "Sena.",
  "Consulting.",
  "IA sem complicação.",
  "Automação.",
];

export default function TypeWriter({ className }: { className?: string }) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[currentPhrase];
    const speed = isDeleting ? 60 : 120;
    const pauseAfterTyping = 2000;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayed.length < phrase.length) {
            setDisplayed(phrase.slice(0, displayed.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), pauseAfterTyping);
          }
        } else {
          if (displayed.length > 0) {
            setDisplayed(phrase.slice(0, displayed.length - 1));
          } else {
            setIsDeleting(false);
            setCurrentPhrase((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting && displayed.length === 0 ? 300 : speed
    );

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, currentPhrase]);

  return (
    <span className={className}>
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}
