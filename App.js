import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Clock, Settings, History, Info } from 'lucide-react-native'; 

function ClockScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerIntervalRef = useRef(null); // Ref to hold the interval ID

  const { addActivity } = useContext(AppContext); // Access addActivity function from context

  // Effect for updating current time
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(clockInterval); // Clean up the interval on component unmount
  }, []);

  // Effect for timer logic
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current); // Stop the interval if timer is not running
    }

    // Cleanup function: clears the interval when the component unmounts or timerRunning changes
    return () => clearInterval(timerIntervalRef.current);
  }, [timerRunning]); // Dependency array: run effect when timerRunning changes

  // Helper function to format seconds into HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(v => v < 10 ? '0' + v : v)
      .join(':');
  };

  const handleStartPause = () => {
    if (timerRunning && timerSeconds > 0) {
      // If pausing a running timer, log the activity
      addActivity({
        id: Date.now(), // Unique ID for the activity
        description: `Timed Session`, // Base description
        durationSeconds: timerSeconds,
        timestamp: new Date().toISOString(), // Log when the session was completed
      });

      // Provide user feedback
      Alert.alert("Session Logged", `Duration: ${formatTime(timerSeconds)}`);
    }

    setTimerRunning(prev => !prev); // Toggle running state
  };

  const handleReset = () => {
    clearInterval(timerIntervalRef.current); // Ensure timer is stopped
    setTimerRunning(false); // Set running state to false
    setTimerSeconds(0); // Reset seconds to zero
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Current Time & Timer</Text>
      <Text style={styles.currentTimeText}>
        {currentTime.toLocaleTimeString()} {/* Displays current local time */}
      </Text>

      <View style={styles.timerContainer}>
        <Text style={styles.timerDisplay}>{formatTime(timerSeconds)}</Text>
        <View style={styles.timerControls}>
          <TouchableOpacity
            style={[styles.timerButton, timerRunning ? styles.pauseButton : styles.startButton]}
            onPress={handleStartPause}
          >
            <Text style={styles.buttonText}>{timerRunning ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.timerButton}
            onPress={handleReset}
            disabled={timerSeconds === 0 && !timerRunning} // Disable reset if timer is at 0 and not running
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.screenText}>
        Monitor real-time clock and manage your stopwatch sessions.
      </Text>
    </View>
  );
}


function SettingsScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>App Settings</Text>
      <Text style={styles.screenText}>
        Configure your time zone, notification preferences, and display options here.
      </Text>
      {/* TouchableOpacity for settings options */}
      <TouchableOpacity style={styles.settingOption}>
        <Text style={styles.settingOptionText}>Time Zone Selection 🌐</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingOption}>
        <Text style={styles.settingOptionText}>Notification Frequency 🔔</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingOption}>
        <Text style={styles.settingOptionText}>Dark Mode Toggle 🌙</Text>
      </TouchableOpacity>
      <Text style={styles.screenText}>
        [Future Enhancement: Interactive toggles and selectors for settings]
      </Text>
    </View>
  );
}

function ActivityLogScreen() {

  const { activityLog } = useContext(AppContext); // Access activityLog from context

  // Renders each individual activity item in the FlatList
  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <Text style={styles.activityDescription}>{item.description}</Text>
      <Text style={styles.activityDuration}>
        Duration: {Math.floor(item.durationSeconds / 3600).toString().padStart(2, '0')}:
        {Math.floor((item.durationSeconds % 3600) / 60).toString().padStart(2, '0')}:
        {(item.durationSeconds % 60).toString().padStart(2, '0')}
      </Text>
      <Text style={styles.activityTimestamp}>
        Logged: {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Activity Log</Text>
      {activityLog.length === 0 ? (
        <Text style={styles.screenText}>No activities logged yet. Start the timer!</Text>
      ) : (
        <FlatList
          data={activityLog} 
          renderItem={renderActivityItem} 
          keyExtractor={(item) => item.id.toString()} 
          contentContainerStyle={styles.activityListContent} 
          style={styles.activityList} 
        />
      )}
    </View>
  );

}

function AboutScreen() {
  return(
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>About This Time App</Text>
      <Text style={styles.screenText}>
        Version 1.0.0
      </Text>
      <Text style={styles.screenText}>
        Developed as a sample application for React Native navigation.
      </Text>
      <Text style={styles.screenText}>
        © 2025 Betsy - BIS
      </Text>
    </View>
  );
}

const Tab = createBottomTabNavigator(); 
const AppContext = createContext();

export default function App() {
  const [activityLog, setActivityLog] = useState([]); // Mock persistence: Array to store activities

  // Function to add a new activity to the log
  const addActivity = (activity) => {
    // Add the new activity at the beginning of the array so latest is always on top
    setActivityLog(prevLog => [activity, ...prevLog]);
  };

  return (
    // AppContext.Provider makes activityLog and addActivity available to all wrapped components
    <AppContext.Provider value={{ activityLog, addActivity }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let IconComponent;

           
              if (route.name === 'Time') { 
                IconComponent = Clock; // New icon for time
              } else if (route.name === 'Settings') {
                IconComponent = Settings;
              } else if (route.name === 'Log') { // Changed from 'Profile' to 'Log'
                IconComponent = History; // New icon for history/log
              } else if (route.name === 'About') {
                IconComponent = Info;
              }

              // Return the selected icon component with appropriate styling
              return <IconComponent size={size} color={color} />;
            },
            tabBarActiveTintColor: '#06D6A0', 
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#f0f0f0',
              height: Dimensions.get('window').height * 0.08,
              paddingBottom: Dimensions.get('window').height * 0.01,
              paddingTop: Dimensions.get('window').height * 0.01,
            },
            tabBarLabelStyle: {
              fontSize: Dimensions.get('window').width * 0.03,
              fontWeight: '600',
            },
            headerShown: false, // Hide the default header
          })}
        >
          {/* Define each screen that will appear as a tab */}
          <Tab.Screen name="Time" component={ClockScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
          <Tab.Screen name="Log" component={ActivityLogScreen} />
          <Tab.Screen name="About" component={AboutScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}


const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8', 
    padding: 20,
    width: Dimensions.get('window').width, 
    height: Dimensions.get('window').height, 
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#073B4C',
    textAlign: 'center',
  },
  screenText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  // ClockScreen specific styles
  currentTimeText: {
    fontSize: 56, 
    fontWeight: '900', 
    color: '#118AB2', 
    marginVertical: 30, 
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8, 
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '700',
    color: '#073B4C', 
    marginBottom: 20,
  },
  timerControls: {
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%',
  },
  timerButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    backgroundColor: '#FFD166', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  startButton: {
    backgroundColor: '#06D6A0',
  },
  pauseButton: {
    backgroundColor: '#FF6B6B', 
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // SettingsScreen specific styles
  settingOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center', 
  },
  settingOptionText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  // ActivityLogScreen specific styles
  activityList: {
    width: '100%',
    flexGrow: 1, 
  },
  activityListContent: {
    paddingBottom: 20,
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    width: Dimensions.get('window').width * 0.9, 
  },
  activityDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#073B4C', 
    marginBottom: 5,
  },
  activityDuration: {
    fontSize: 16,
    color: '#118AB2',
    marginBottom: 3,
  },
  activityTimestamp: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});

