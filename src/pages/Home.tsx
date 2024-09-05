import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/plan');
    };

    return (
        <div>
            <h2>Welcome to trip planner app</h2>
            <button onClick={handleButtonClick}>Go to trip Planning</button>
        </div>
    );
}