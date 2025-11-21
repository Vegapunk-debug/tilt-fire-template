import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Text, TouchableWithoutFeedback, Image, Animated } from "react-native";
import { Accelerometer } from "expo-sensors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 60;
const BASKET_Y = screenHeight - 120;

const FRUIT_SIZE = 50;
const FRUIT_SPEED = 6;
const SPAWN_RATE = 1200;

const fruitImages = [
  require("./assets/apple.avif"),
  require("./assets/orange.webp"),
  require("./assets/banana.jpeg"),
  require("./assets/watermelon.jpeg"),
];

export default function App() {
  const basketX = useRef(new Animated.Value((screenWidth - BASKET_WIDTH) / 2)).current;
  const basketXRef = useRef((screenWidth - BASKET_WIDTH) / 2);
  const basketBoundsRef = useRef({});

  const [fallingFruits, setFallingFruits] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false)


  basketX.addListener(({ value }) => {
    basketXRef.current = value;
    basketBoundsRef.current = {
      left: value,
      right: value + BASKET_WIDTH,
      top: BASKET_Y,
      bottom: BASKET_Y + BASKET_HEIGHT,
    };
  });

  useEffect(() => {
    if (gameOver) return;

    Accelerometer.setUpdateInterval(16);
    const subscription = Accelerometer.addListener(({ x }) => {
      Animated.timing(basketX, {
        toValue: Math.max(0, Math.min(screenWidth - BASKET_WIDTH, basketXRef.current - x * 35)),
        duration: 16,
        useNativeDriver: false,
      }).start();
    });

    return () => subscription.remove();
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const spawnInterval = setInterval(() => {
      setFallingFruits(prev => [
        ...prev,
        {
          id: Date.now(),
          image: fruitImages[Math.floor(Math.random() * fruitImages.length)],
          x: Math.random() * (screenWidth - FRUIT_SIZE),
          y: -FRUIT_SIZE,
        }
      ]);
    }, SPAWN_RATE);

    const moveInterval = setInterval(() => {
      setFallingFruits(prev =>
        prev.reduce((acc, f) => {
          const moved = { ...f, y: f.y + FRUIT_SPEED };

          const b = basketBoundsRef.current;
          const caught =
            moved.x < b.right &&
            moved.x + FRUIT_SIZE > b.left &&
            moved.y + FRUIT_SIZE > b.top &&
            moved.y < b.bottom;

          if (caught) {
            setScore(s => s + 1);
            return acc;
          }

          if (moved.y > screenHeight) {
            setGameOver(true);
            return acc;
          }

          acc.push(moved);
          return acc;
        }, [])
      );
    }, 16);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [gameOver]);

  const resetGame = () => {
    setScore(0);
    setFallingFruits([]);
    setGameOver(false);

    basketXRef.current = (screenWidth - BASKET_WIDTH) / 2;
    basketX.setValue(basketXRef.current);
  };

  return (
    <TouchableWithoutFeedback onPress={gameOver ? resetGame : null}>
      <View style={styles.container}>

        <Animated.Image
          source={require("./assets/basket.jpeg")}
          style={[styles.basket, { left: basketX, top: BASKET_Y }]}
        />

        {fallingFruits.map(fruit => (
          <Image
            key={fruit.id}
            source={fruit.image}
            style={[styles.fruit, { left: fruit.x, top: fruit.y }]}
          />
        ))}

        <Text style={styles.score}>Score: {score}</Text>

        {gameOver && <Text style={styles.gameOverText}>GAME OVER - Tap to Restart</Text>}

        <StatusBar style="light" />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  basket: {
    position: "absolute",
    width: BASKET_WIDTH,
    height: BASKET_HEIGHT,
    resizeMode: "contain",
  },
  fruit: {
    position: "absolute",
    width: FRUIT_SIZE,
    height: FRUIT_SIZE,
    resizeMode: "contain",
  },
  score: {
    position: "absolute",
    top: 40,
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
  },
  gameOverText: {
    position: "absolute",
    top: screenHeight / 2 - 50,
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff3333",
  },
});
