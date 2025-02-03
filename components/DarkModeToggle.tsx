interface DarkModeToggleProps {
  toggleDarkMode: () => void;
}

const DarkModeToggle = ({ toggleDarkMode }: DarkModeToggleProps) => {
  return (
    <button onClick={toggleDarkMode} className="p-2">
      Toggle Dark Mode
    </button>
  );
};

export default DarkModeToggle;
