import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';  // Import des hooks de expo-video
import LightButton from './buttons/LightButton';

const { width, height } = Dimensions.get('window');
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const steps = [
  { title: 'What’s a mozaï', paragraph: 'For you to be able to take full advantage of the application, however, we need access to your photos. This is because the application uses your own images to personalize your experience and provide you with the best possible functionality.', video: require('../assets/videos/splashscreen/start.mp4')},
  { title: 'Photo privacy', paragraph: 'Your privacy is very important to us. Your photos are completely private and will never be shared or stored on our servers. They are only used within the application to provide you with a personalized experience.', video: require('../assets/videos/splashscreen/start.mp4')},
  { title: 'Photo sharing', paragraph: 'This application lets you share your photos with friends and family in a private and secure circle. You retain total control over what you choose to share, and we ensure that your experience remains personal and intimate.', video: require('../assets/videos/splashscreen/start.mp4')}
];

interface OnboardingProps {
    onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  // Création du player vidéo (Réinitialisation forcée en changeant `key` sur `VideoView`)
  const player = useVideoPlayer(steps[step].video, player => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    player.play(); // Redémarre la vidéo lors du changement de step
  }, [step]);

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };
  
  return (
    <View style={styles.container}>
        {/* Barre de progression en haut */}
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              { backgroundColor: index <= step ? '#FFFFFF' : '#A6A6A6' }
            ]}
          />
        ))}
      </View>

      {/* Vidéo */}
      <VideoView
        key={step} // Clé pour recharger le composant VideoView à chaque changement
        style={[styles.video, { borderRadius: 15, overflow: 'hidden' }]}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />

        {/* Texte d'onboarding */}
      <Text style={styles.title}>{steps[step].title}</Text>
      <Text style={styles.paragraph}>{steps[step].paragraph}</Text>

      {/* Bouton "Suivant" */}
      <LightButton
        title={step < steps.length - 1 ? "Next" : "Get started!"}
        onPress={nextStep}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: '#000', // Fond noir pour un effet plus immersif
      paddingTop: 40 // Pour éviter l'encoche des téléphones
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '90%',
      marginBottom: 30,
      marginTop: 20
    },
    progressBar: {
      flex: 1,
      height: 4,
      backgroundColor: '#808080',
      marginHorizontal: 3,
      borderRadius: 2
    },
    video: {
      width: width * 0.9,
      height: height * 0.55,
      borderRadius: 15,
      marginBottom: 20
    },
    title: {
      fontSize: 26,
      fontWeight: 600,
      color: '#ffffff',
      marginBottom: 10,
      textAlign: 'left',
      width: '90%'
    },
    paragraph: {
      fontSize: 20,
      color: '#ffffff',
      textAlign: 'left',
      marginBottom: 20,
    //   paddingHorizontal: 20,
      fontWeight: 300,
      width: '90%'
    },
    button: {
        width: width / 1.1,
    }
  });

