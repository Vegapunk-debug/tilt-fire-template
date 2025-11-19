import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { Accelerometer } from "expo-sensors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

const BULLET_WIDTH = 10;
const BULLET_HEIGHT = 20;

const BLOCK_WIDTH = 40;
const BLOCK_HEIGHT = 40;

export default function App() {
  const [playerX, setPlayerX] = useState((screenWidth - PLAYER_WIDTH) / 2);

  useEffect(() => {
    Accelerometer.setUpdateInterval(1000);

    const subscription = Accelerometer.addListener(({x}) => {
      console.log("Value of X:", x)
      const move = x * 250
      setPlayerX(prev => prev + move)
    })

    return () => subscription.remove();
  }, [])

  return (
    <View style={styles.container}>
      <View style={[styles.player, { left: playerX }]} />
      <Text style={styles.instruction}>Tilt your phone to move</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
  },
  player: {
    position: "absolute",
    bottom: 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#000",
  },
  instruction: {
    position: "absolute",
    top: 70,
    color: "#fff",
    fontFamily: "Courier",
    fontSize: 14,
  },
  bullet: {
    position: "absolute",
    width: BULLET_WIDTH,
    height: BULLET_HEIGHT,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#000",
  },
  fallingBlock: {
    position: "absolute",
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "black",
  },
  gameOverText: {
    position: "absolute",
    top: screenHeight / 2 - 40,
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Courier",
  },
});
