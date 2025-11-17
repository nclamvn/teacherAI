import Icon from '../../components/ui/Icon';
import './OnboardingSteps.css';

const Step1LearningStyle = ({ selectedStyle, onSelect }) => {
  const styles = [
    {
      id: 'quick_practical',
      title: 'Quick & Practical',
      titleVi: 'Nhanh & Thực Tế',
      duration: '10-15 min/day',
      description: 'Focus on conversations and practical phrases you can use right away.',
      descriptionVi: 'Tập trung hội thoại và mẫu câu thực dụng dùng ngay được.',
      icon: 'zap'
    },
    {
      id: 'structured_grammar',
      title: 'Structured & Grammar-friendly',
      titleVi: 'Có Cấu Trúc & Ngữ Pháp',
      duration: '15-20 min/day',
      description: 'Learn with detailed explanations and grammar foundations.',
      descriptionVi: 'Học với giải thích chi tiết và nền tảng ngữ pháp vững chắc.',
      icon: 'book-open'
    },
    {
      id: 'speaking_focused',
      title: 'Speaking-focused',
      titleVi: 'Tập Trung Nói',
      duration: '10-15 min/day',
      description: 'Lots of speaking practice, less theory. Jump right into conversations.',
      descriptionVi: 'Nhiều luyện nói, ít lý thuyết. Nhảy thẳng vào hội thoại.',
      icon: 'mic'
    }
  ];

  return (
    <div className="step-container">
      <h2 className="step-title">How do you want to learn?</h2>
      <p className="step-subtitle">Bạn muốn học theo cách nào?</p>

      <div className="style-cards">
        {styles.map(style => (
          <div
            key={style.id}
            className={`style-card glass ${selectedStyle === style.id ? 'selected' : ''}`}
            onClick={() => onSelect(style.id)}
          >
            <div className="card-icon">
              <Icon name={style.icon} size="2xl" />
            </div>
            <h3 className="card-title">{style.title}</h3>
            <p className="card-title-vi">{style.titleVi}</p>
            <p className="card-duration">{style.duration}</p>
            <p className="card-description">{style.description}</p>
            <p className="card-description-vi">{style.descriptionVi}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step1LearningStyle;
