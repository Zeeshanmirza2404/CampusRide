import React from 'react';

const EmptyState = ({
  icon,
  title,
  description,
  buttonText,
  buttonIcon,
  onButtonClick
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="mb-2">{title}</h5>
      <p className="text-muted-custom mb-4">{description}</p>
      <button className="btn btn-primary-custom" onClick={onButtonClick}>
        {buttonIcon && <i className={`bi ${buttonIcon} me-2`}></i>}
        {buttonText}
      </button>
    </div>
  );
};

export default EmptyState;
