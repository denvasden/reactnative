import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {NavigationContainer} from '@react-navigation/native';
import {Text, View} from 'react-native';

const Stack = createNativeStackNavigator();

const navigationMenuItems = [
  {id: 'about', path: 'About', title: 'About'},
  {id: 'home', path: 'Home', title: 'Home'},
  {id: 'podcast', path: 'Podcast', title: 'Podcast'},
  {id: 'profile', path: 'Profile', title: 'Profile'},
];

const navigationMenuViewStyle = {
  alignItems: 'center',
  backgroundColor: '#000000',
  bottom: 0,
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  height: 128,
  justifyContent: 'center',
  left: 0,
  opacity: 0.5,
  position: 'absolute',
  right: 0,
  shadowColor: '#f2b48c',
  shadowOffset: {
    height: -4,
    width: 0,
  },
  shadowOpacity: 1,
  shadowRadius: 4,
  width: '100%',
};
const rootViewStyle = {
  backgroundColor: '#ffffff',
  display: 'flex',
  height: '100%',
  position: 'relative',
  width: '100%',
};
const screenViewStyle = {
  alignItems: 'center',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  height: '100%',
  justifyContent: 'center',
  position: 'relative',
  width: '100%',
};

function About() {
  return (
    <View style={screenViewStyle}>
      <Text>About Screen</Text>
    </View>
  );
}

function Home() {
  return (
    <View style={screenViewStyle}>
      <Text>Home Screen</Text>
    </View>
  );
}

function NavigationMenu() {
  const navigation = useNavigation();

  const handlePress = path => {
    navigation.navigate(path);
  };

  return (
    <View style={navigationMenuViewStyle}>
      {navigationMenuItems.map(navigationMenuItem => (
        <Text
          key={navigationMenuItem.id}
          onPress={handlePress.bind(null, navigationMenuItem.path)}
          style={{
            color: '#ffffff',
            fontSize: 20,
            marginLeft: 8,
            marginRight: 8,
            padding: 8,
          }}>
          {navigationMenuItem.title}
        </Text>
      ))}
    </View>
  );
}

function Podcast() {
  return (
    <View style={screenViewStyle}>
      <Text>Podcast Screen</Text>
    </View>
  );
}

function Profile() {
  return (
    <View style={screenViewStyle}>
      <Text>Profile Screen</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <View style={rootViewStyle}>
        <Stack.Navigator>
          <Stack.Screen name="About" component={About} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Podcast" component={Podcast} />
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>

        <NavigationMenu />
      </View>
    </NavigationContainer>
  );
}
