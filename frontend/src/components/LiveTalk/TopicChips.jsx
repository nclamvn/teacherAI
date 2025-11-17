import Icon from '../ui/Icon';
import './LiveTalk.css';

const TOPICS = [
  { id: 'daily_life', label: 'Daily Life', icon: 'coffee' },
  { id: 'travel', label: 'Travel', icon: 'plane' },
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'hobbies', label: 'Hobbies', icon: 'film' }
];

const TopicChips = ({ selectedTopic, onSelectTopic }) => {
  return (
    <div className="topic-chips">
      {TOPICS.map(topic => (
        <button
          key={topic.id}
          className={`topic-chip ${selectedTopic === topic.id ? 'active' : ''}`}
          onClick={() => onSelectTopic(topic.id)}
          title={`Talk about ${topic.label.toLowerCase()}`}
        >
          <Icon name={topic.icon} size="sm" />
          <span>{topic.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TopicChips;
