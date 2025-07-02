import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Shield, MessageCircle, Search, BarChart3 } from 'lucide-react';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0 2rem;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  text-decoration: none;
`;

const LogoIcon = styled(Shield)`
  width: 32px;
  height: 32px;
  color: #4299e1;
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  color: ${props => props.$isActive ? '#ffffff' : '#4a5568'};
  background: ${props => props.$isActive ? 'linear-gradient(135deg, #4299e1, #3182ce)' : 'transparent'};
  
  &:hover {
    background: ${props => props.$isActive ? 'linear-gradient(135deg, #3182ce, #2c5aa0)' : 'rgba(66, 153, 225, 0.1)'};
    color: ${props => props.$isActive ? '#ffffff' : '#2d3748'};
    transform: translateY(-1px);
  }
`;

const IconWrapper = styled.div`
  width: 20px;
  height: 20px;
`;

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <HeaderContainer>
      <Logo as={Link} to="/">
        <LogoIcon />
        Dubai Police Crime Research
      </Logo>
      
      <Nav>
        <NavLink to="/" $isActive={isActive('/')}>
          <IconWrapper>
            <BarChart3 size={20} />
          </IconWrapper>
          Dashboard
        </NavLink>
        
        <NavLink to="/chat" $isActive={isActive('/chat')}>
          <IconWrapper>
            <MessageCircle size={20} />
          </IconWrapper>
          AI Chat
        </NavLink>
        
        <NavLink to="/search" $isActive={isActive('/search')}>
          <IconWrapper>
            <Search size={20} />
          </IconWrapper>
          Crime Search
        </NavLink>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
