import { useSelector } from 'react-redux';

import { Space, Container } from '@mantine/core';
import { RootState } from '../redux/store';
import { BadgeCard } from '../components/attractionCard';

const AttractionsView = () => {
  const attractions = useSelector((state: RootState) => state.planResult.attractions);
  const dummyBadges = [
    { emoji: '🌟', label: 'Popular' },
    { emoji: '🌍', label: 'Global' },
    { emoji: '🎉', label: 'Must See' },
  ];

  return (
    <Container>
      <h1>Trip plan</h1>
      {attractions && attractions.map((attraction, index) => (
      <>
          <BadgeCard
              key={index}
              image={attraction.cover_img_url}
              title={attraction.name}
              description={"very nice location"}
              badges={dummyBadges}
          />
          <Space h="lg" />
      </>
      ))}
    </Container>
  );
};

export default AttractionsView;