import React, { useState } from 'react';
import { FaHandHoldingHeart, FaMoneyBillWave, FaCreditCard, FaPhone } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Giving.css';

const Giving = () => {
  const [step, setStep] = useState(1); // 1: select type, 2: show payment info
  const [givingType, setGivingType] = useState('');
  
  // This will be set by admin later
  const churchMomoNumber = '0244123456'; // Placeholder - will come from backend

  const givingTypes = [
    {
      id: 'tithe',
      name: 'Tithe',
      icon: <FaMoneyBillWave />,
      description: 'Give your tithe as commanded in Malachi 3:10'
    },
    {
      id: 'offering',
      name: 'Offering',
      icon: <FaHandHoldingHeart />,
      description: 'Give a freewill offering to support the ministry'
    },
    {
      id: 'help',
      name: 'Help',
      icon: <FaCreditCard />,
      description: 'Support special projects and community outreach'
    }
  ];

  const handleTypeSelect = (type) => {
    setGivingType(type);
  };

  const handleProceed = () => {
    if (givingType) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setGivingType('');
  };

  const selectedType = givingTypes.find(type => type.id === givingType);

  return (
    <div className="giving-page">
      <Header />
      
      <section className="giving-hero">
        <div className="container">
          <h1 className="page-title">Giving</h1>
          <p className="page-subtitle">Support the ministry and make a difference</p>
        </div>
      </section>

      <section className="giving-content">
        <div className="container">
          {step === 1 ? (
            <div className="giving-step-1">
              <div className="step-header">
                <h2>Select Giving Type</h2>
                <p>Choose how you would like to give</p>
              </div>
              
              <div className="giving-types-grid">
                {givingTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`giving-type-card ${givingType === type.id ? 'selected' : ''}`}
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <div className="type-icon">{type.icon}</div>
                    <h3>{type.name}</h3>
                    <p>{type.description}</p>
                  </div>
                ))}
              </div>

              <div className="proceed-section">
                <button 
                  className="proceed-btn"
                  onClick={handleProceed}
                  disabled={!givingType}
                >
                  Proceed
                </button>
              </div>
            </div>
          ) : (
            <div className="giving-step-2">
              <div className="step-header">
                <h2>Payment Information</h2>
                <p>Send your {selectedType?.name.toLowerCase()} to the number below</p>
              </div>

              <div className="payment-info-card">
                <div className="selected-type-display">
                  <div className="type-icon-large">{selectedType?.icon}</div>
                  <h3>{selectedType?.name}</h3>
                </div>

                <div className="momo-section">
                  <div className="momo-label">
                    <FaPhone />
                    <span>Mobile Money Number</span>
                  </div>
                  <div className="momo-number">
                    {churchMomoNumber}
                  </div>
                  <p className="momo-note">
                    Please use this number when sending your {selectedType?.name.toLowerCase()}. 
                    Include your name as reference.
                  </p>
                </div>

                <div className="payment-actions">
                  <button className="back-btn" onClick={handleBack}>
                    Back
                  </button>
                  <button 
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(churchMomoNumber);
                      alert('Number copied to clipboard!');
                    }}
                  >
                    Copy Number
                  </button>
                </div>
              </div>

              <div className="giving-info">
                <h3>Thank You for Your Generosity</h3>
                <p>
                  Your giving helps us continue our mission of spreading the Gospel, 
                  supporting our community, and making a positive impact in the lives of many. 
                  We appreciate your faithfulness and generosity.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Giving;
