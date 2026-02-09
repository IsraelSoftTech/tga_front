import React, { useState, useEffect } from 'react';
import { FaHandHoldingHeart, FaMoneyBillWave, FaCreditCard, FaPhone } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { homeAPI } from '../api';
import './Giving.css';

const Giving = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: select type, 2: show payment info
  const [givingType, setGivingType] = useState('');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await homeAPI.getContent();
      if (response.success) {
        setContent(response.data || {});
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getValue = (key, defaultValue = '') => {
    return content?.giving_page?.[key]?.value || defaultValue;
  };

  const givingTypes = [
    {
      id: 'tithe',
      name: getValue('giving_type1_name', 'Tithe'),
      icon: <FaMoneyBillWave />,
      description: getValue('giving_type1_description', 'Give your tithe as commanded in Malachi 3:10')
    },
    {
      id: 'offering',
      name: getValue('giving_type2_name', 'Offering'),
      icon: <FaHandHoldingHeart />,
      description: getValue('giving_type2_description', 'Give a freewill offering to support the ministry')
    },
    {
      id: 'help',
      name: getValue('giving_type3_name', 'Help'),
      icon: <FaCreditCard />,
      description: getValue('giving_type3_description', 'Support special projects and community outreach')
    }
  ];

  const churchMomoNumber = getValue('momo_number', '0244123456');

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

  if (loading) {
    return (
      <div className="giving-page">
        <Header />
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="giving-page">
      <Header />
      
      <section className="giving-hero">
        <div className="container">
          <h1 className="page-title">{getValue('hero_title', 'Giving')}</h1>
          <p className="page-subtitle">{getValue('hero_subtitle', 'Support the ministry and make a difference')}</p>
        </div>
      </section>

      <section className="giving-content">
        <div className="container">
          {step === 1 ? (
            <div className="giving-step-1">
              <div className="step-header">
                <h2>{getValue('step1_title', 'Select Giving Type')}</h2>
                <p>{getValue('step1_subtitle', 'Choose how you would like to give')}</p>
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
                <h2>{getValue('step2_title', 'Payment Information')}</h2>
                <p>{getValue('step2_subtitle_template', 'Send your {type} to the number below').replace('{type}', selectedType?.name.toLowerCase() || 'donation')}</p>
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
                    {getValue('momo_note_template', 'Please use this number when sending your {type}. Include your name as reference.').replace('{type}', selectedType?.name.toLowerCase() || 'donation')}
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
                <h3>{getValue('thank_you_title', 'Thank You for Your Generosity')}</h3>
                <p>{getValue('thank_you_message', 'Your giving helps us continue our mission of spreading the Gospel, supporting our community, and making a positive impact in the lives of many. We appreciate your faithfulness and generosity.')}</p>
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
