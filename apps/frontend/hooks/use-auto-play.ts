import { useEffect, useState } from "react";
import type { Scene } from "./use-debate-scenes";

export function useAutoPlay(scenes: Scene[], initialAutoPlay = true) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(initialAutoPlay);

  const currentScene = scenes[currentSceneIndex] || null;

  // Auto-advance
  useEffect(() => {
    if (!isPlaying || !currentScene) return;

    const timer = setTimeout(() => {
      if (currentSceneIndex < scenes.length - 1) {
        setCurrentSceneIndex((i) => i + 1);
      } else {
        setIsPlaying(false); // End of debate
      }
    }, currentScene.duration);

    return () => clearTimeout(timer);
  }, [currentSceneIndex, isPlaying, currentScene, scenes.length]);

  const next = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex((i) => i + 1);
    }
  };

  const prev = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((i) => i - 1);
    }
  };

  const togglePlay = () => setIsPlaying((p) => !p);

  const goToScene = (index: number) => {
    if (index >= 0 && index < scenes.length) {
      setCurrentSceneIndex(index);
    }
  };

  return {
    currentScene,
    currentSceneIndex,
    totalScenes: scenes.length,
    isPlaying,
    togglePlay,
    next,
    prev,
    goToScene,
  };
}
