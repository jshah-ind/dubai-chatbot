import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { MessageCircle, Search, Activity, Shield } from 'lucide-react';
import { healthAPI } from '../services/api';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Hero = styled.section`
  text-align: center;
  margin-bottom: 4rem;
  color: white;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FeatureCard = styled(Link)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 1);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 15px;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2d3748;
`;

const FeatureDescription = styled.p`
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const FeatureButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #4299e1;
  font-weight: 500;
  
  &:hover {
    color: #3182ce;
  }
`;

const StatusSection = styled.section`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatusTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusIndicator = styled.div<{ $status: 'healthy' | 'error' | 'loading' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  background: ${props => {
    switch (props.$status) {
      case 'healthy': return '#48bb78';
      case 'error': return '#f56565';
      default: return '#ed8936';
    }
  }};
  color: white;
`;

const Dashboard: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'loading' | 'healthy' | 'error'>('loading');

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await healthAPI.checkHealth();
        setApiStatus('healthy');
      } catch (error) {
        setApiStatus('error');
      }
    };

    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardContainer>
      <Hero>
        <Title>Dubai Police Crime Research Platform</Title>
        <Subtitle>
          Advanced AI-powered crime analysis and research tools for law enforcement professionals.
          Access real-time crime data, trends, and insights through our intelligent chat and search interfaces.
        </Subtitle>
      </Hero>

      <FeaturesGrid>
        <FeatureCard to="/chat">
          <FeatureIcon>
            <MessageCircle size={30} />
          </FeatureIcon>
          <FeatureTitle>AI Crime Chat</FeatureTitle>
          <FeatureDescription>
            Engage with our AI assistant to get instant insights about crime trends, statistics, and analysis.
            Ask natural language questions and receive detailed, contextual responses.
          </FeatureDescription>
          <FeatureButton>
            Start Chatting →
          </FeatureButton>
        </FeatureCard>

        <FeatureCard to="/search">
          <FeatureIcon>
            <Search size={30} />
          </FeatureIcon>
          <FeatureTitle>Advanced Crime Search</FeatureTitle>
          <FeatureDescription>
            Search and filter crime data by time period, location, crime type, and severity level.
            Get structured results with detailed case information and agency involvement.
          </FeatureDescription>
          <FeatureButton>
            Search Crimes →
          </FeatureButton>
        </FeatureCard>
      </FeaturesGrid>

      <StatusSection>
        <StatusTitle>
          <Activity size={24} />
          System Status
        </StatusTitle>
        <StatusIndicator $status={apiStatus}>
          <Shield size={16} />
          API Status: {apiStatus === 'loading' ? 'Checking...' : apiStatus === 'healthy' ? 'Online' : 'Offline'}
        </StatusIndicator>
      </StatusSection>
    </DashboardContainer>
  );
};

export default Dashboard;
