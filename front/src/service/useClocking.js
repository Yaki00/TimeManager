import { useState, useEffect, useCallback } from "react";
import { clockingApi } from "../api/clocking";
import { useUserStore } from "../zustand/store";

/**
 * Hook personnalisé pour gérer l'état de clocking (prise de fonction)
 */
export const useClocking = () => {
  const [isWorking, setIsWorking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentClocking, setCurrentClocking] = useState(null);
  const [workStartTime, setWorkStartTime] = useState(null);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [elapsedWorkTime, setElapsedWorkTime] = useState(0); // en secondes
  const [elapsedBreakTime, setElapsedBreakTime] = useState(0); // en secondes
  const [loading, setLoading] = useState(false);
  const [pauseHistory, setPauseHistory] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [previousWorkTime, setPreviousWorkTime] = useState(0); // en secondes
  const [previousBreakTime, setPreviousBreakTime] = useState(0); // en secondes
  const [todayData, setTodayData] = useState(null); // Données complètes de la journée

  const user = useUserStore((state) => state.user);

  // Format time string HH:MM:SS
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // Format date YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Charger l'état de clocking depuis localStorage au démarrage
  useEffect(() => {
    const savedState = localStorage.getItem("clockingState");
    if (savedState) {
      const state = JSON.parse(savedState);
      setIsWorking(state.isWorking);
      setIsPaused(state.isPaused);
      setCurrentClocking(state.currentClocking);
      if (state.workStartTime) setWorkStartTime(new Date(state.workStartTime));
      if (state.pauseStartTime)
        setPauseStartTime(new Date(state.pauseStartTime));
      if (state.sessionStartTime)
        setSessionStartTime(new Date(state.sessionStartTime));
      setElapsedWorkTime(state.elapsedWorkTime || 0);
      setElapsedBreakTime(state.elapsedBreakTime || 0);
      setPauseHistory(state.pauseHistory || []);
      setPreviousWorkTime(state.previousWorkTime || 0);
      setPreviousBreakTime(state.previousBreakTime || 0);
      setTodayData(state.todayData || null);
    }
  }, []);

  // Sauvegarder l'état dans localStorage
  const saveState = useCallback((state) => {
    localStorage.setItem("clockingState", JSON.stringify(state));
  }, []);

  // Timer pour calculer le temps écoulé (en secondes)
  useEffect(() => {
    let interval;
    if (isWorking && !isPaused && workStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const workSeconds = Math.floor((now - workStartTime) / 1000);
        setElapsedWorkTime(workSeconds);
      }, 1000);
    } else if (isPaused && pauseStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const breakSeconds = Math.floor((now - pauseStartTime) / 1000);
        setElapsedBreakTime(breakSeconds);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorking, isPaused, workStartTime, pauseStartTime]);

  /**
   * Démarrer la prise de fonction
   */
  const startWork = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      const today = formatDate(now);

      // Vérifier s'il existe déjà un clocking pour aujourd'hui
      let clocking;
      let previousWork = 0;
      let previousBreak = 0;

      try {
        const existingClockings = await clockingApi.getClockingsByUserAndDate(
          user.id,
          today
        );

        if (existingClockings && existingClockings.length > 0) {
          // Il existe déjà un clocking pour aujourd'hui - on le réutilise
          clocking = existingClockings[0];
          previousWork = clocking.workTime || 0;
          previousBreak = clocking.breakTime || 0;

          console.log("Clocking existant trouvé, accumulation des temps:", {
            previousWork,
            previousBreak,
            firstArrival: clocking.firstArrival,
            clockingId: clocking.id,
          });
        } else {
          // Aucun clocking existant, en créer un nouveau avec firstArrival
          const clockingData = {
            userId: user.id,
            clockingDate: today,
            firstArrival: formatTime(now), // Définir SEULEMENT à la création
            workTime: 0,
            breakTime: 0,
            totalHours: 0,
            weekDay: [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ][now.getDay()],
          };

          clocking = await clockingApi.createClocking(clockingData);
          console.log(
            "Nouveau clocking créé avec firstArrival:",
            formatTime(now)
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification du clocking existant:",
          error
        );
        // En cas d'erreur, créer un nouveau clocking
        const clockingData = {
          userId: user.id,
          clockingDate: today,
          firstArrival: formatTime(now),
          workTime: 0,
          breakTime: 0,
          totalHours: 0,
          weekDay: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ][now.getDay()],
        };

        clocking = await clockingApi.createClocking(clockingData);
      }

      setIsWorking(true);
      setIsPaused(false);
      setCurrentClocking(clocking);
      setWorkStartTime(now);
      setSessionStartTime(now);
      setElapsedWorkTime(0);
      setElapsedBreakTime(0);
      setPauseHistory([]);
      setPreviousWorkTime(previousWork);
      setPreviousBreakTime(previousBreak);

      const state = {
        isWorking: true,
        isPaused: false,
        currentClocking: clocking,
        workStartTime: now.toISOString(),
        sessionStartTime: now.toISOString(),
        pauseStartTime: null,
        elapsedWorkTime: 0,
        elapsedBreakTime: 0,
        pauseHistory: [],
        previousWorkTime: previousWork,
        previousBreakTime: previousBreak,
        todayData: null,
      };
      saveState(state);

      console.log("État sauvegardé après démarrage:", {
        previousWork,
        previousBreak,
        firstArrival: clocking.firstArrival,
      });
    } catch (error) {
      console.error("Erreur lors du démarrage:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mettre en pause
   */
  const pauseWork = () => {
    if (!isWorking || isPaused) return;

    const now = new Date();
    const workSeconds = Math.floor((now - workStartTime) / 1000);

    setIsPaused(true);
    setPauseStartTime(now);
    setElapsedWorkTime(workSeconds);

    const state = {
      isWorking: true,
      isPaused: true,
      currentClocking,
      workStartTime: workStartTime.toISOString(),
      sessionStartTime: sessionStartTime.toISOString(),
      pauseStartTime: now.toISOString(),
      elapsedWorkTime: workSeconds,
      elapsedBreakTime: 0,
      pauseHistory,
      previousWorkTime,
      previousBreakTime,
    };
    saveState(state);
  };

  /**
   * Reprendre le travail après une pause
   */
  const resumeWork = () => {
    if (!isWorking || !isPaused) return;

    const now = new Date();
    const breakSeconds = Math.floor((now - pauseStartTime) / 1000);

    // Ajouter la pause à l'historique
    const newPause = {
      start: pauseStartTime.toISOString(),
      end: now.toISOString(),
      duration: breakSeconds,
    };
    const updatedHistory = [...pauseHistory, newPause];
    setPauseHistory(updatedHistory);

    setIsPaused(false);
    setWorkStartTime(now);
    setElapsedBreakTime((prev) => prev + breakSeconds);

    const state = {
      isWorking: true,
      isPaused: false,
      currentClocking,
      workStartTime: now.toISOString(),
      sessionStartTime: sessionStartTime.toISOString(),
      pauseStartTime: null,
      elapsedWorkTime: 0,
      elapsedBreakTime: elapsedBreakTime + breakSeconds,
      pauseHistory: updatedHistory,
      previousWorkTime,
      previousBreakTime,
    };
    saveState(state);
  };

  /**
   * Terminer la prise de fonction
   */
  const stopWork = async () => {
    if (!isWorking || !currentClocking) return;

    setLoading(true);
    try {
      const now = new Date();
      let totalWorkTime = elapsedWorkTime;
      let totalBreakTime = elapsedBreakTime;

      // Si on termine pendant le travail, ajouter le temps depuis la dernière reprise
      if (!isPaused && workStartTime) {
        const additionalWorkSeconds = Math.floor((now - workStartTime) / 1000);
        totalWorkTime += additionalWorkSeconds;
      }

      // Si on termine pendant une pause, ajouter le temps de pause
      if (isPaused && pauseStartTime) {
        const additionalBreakSeconds = Math.floor(
          (now - pauseStartTime) / 1000
        );
        totalBreakTime += additionalBreakSeconds;
      }

      // Accumuler avec les temps précédents
      const finalWorkTime = totalWorkTime + previousWorkTime;
      const finalBreakTime = totalBreakTime + previousBreakTime;

      // Mettre à jour le clocking (en secondes)
      const updateData = {
        lastDeparture: formatTime(now),
        workTime: finalWorkTime,
        breakTime: finalBreakTime,
        totalHours: (finalWorkTime / 3600).toFixed(2), // Convertir secondes en heures
      };

      console.log("Mise à jour du clocking avec accumulation:", {
        sessionWorkTime: totalWorkTime,
        sessionBreakTime: totalBreakTime,
        previousWorkTime,
        previousBreakTime,
        finalWorkTime,
        finalBreakTime,
      });

      await clockingApi.updateClocking(currentClocking.id, updateData);

      // Sauvegarder les données de la journée pour consultation
      const dayData = {
        firstArrival: currentClocking.firstArrival,
        lastDeparture: now,
        totalWorkTime: finalWorkTime,
        totalBreakTime: finalBreakTime,
        pauseHistory: pauseHistory,
        date: formatDate(now),
      };
      setTodayData(dayData);

      // Réinitialiser l'état de la session mais garder les totaux de la journée
      setIsWorking(false);
      setIsPaused(false);
      setCurrentClocking(null);
      setWorkStartTime(null);
      setPauseStartTime(null);
      setSessionStartTime(null);
      setElapsedWorkTime(0);
      setElapsedBreakTime(0);
      setPauseHistory([]);
      // NE PAS réinitialiser previousWorkTime et previousBreakTime pour la journée
      setPreviousWorkTime(finalWorkTime);
      setPreviousBreakTime(finalBreakTime);

      // Sauvegarder l'état pour pouvoir consulter les infos même après avoir terminé
      const state = {
        isWorking: false,
        isPaused: false,
        currentClocking: null,
        workStartTime: null,
        sessionStartTime: null,
        pauseStartTime: null,
        elapsedWorkTime: 0,
        elapsedBreakTime: 0,
        pauseHistory: [],
        previousWorkTime: finalWorkTime,
        previousBreakTime: finalBreakTime,
        todayData: dayData,
      };
      saveState(state);
    } catch (error) {
      console.error("Erreur lors de l'arrêt:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formater le temps en HH:MM:SS pour l'affichage (depuis secondes)
  const formatDisplayTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  // Formater une date en HH:MM simple
  const formatTimeSimple = (date) => {
    if (!date) return "--:--";
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Calculer le temps actuel de pause en cours (si en pause) en secondes
  const getCurrentBreakTime = () => {
    if (isPaused && pauseStartTime) {
      const now = new Date();
      return Math.floor((now - pauseStartTime) / 1000);
    }
    return 0;
  };

  // Calculer les totaux avec l'accumulation
  const getTotalWorkTimeWithPrevious = () => {
    return elapsedWorkTime + previousWorkTime;
  };

  const getTotalBreakTimeWithPrevious = () => {
    return elapsedBreakTime + previousBreakTime + getCurrentBreakTime();
  };

  // Vérifier si on a des données pour aujourd'hui
  const hasTodayData = () => {
    if (isWorking) return true;
    if (todayData && todayData.date === formatDate(new Date())) return true;
    return previousWorkTime > 0 || previousBreakTime > 0;
  };

  // Obtenir le firstArrival depuis le clocking actuel ou todayData
  const getFirstArrival = () => {
    const arrival = currentClocking?.firstArrival || todayData?.firstArrival;
    console.log("getFirstArrival appelé:", {
      arrival,
      type: typeof arrival,
      currentClocking: currentClocking?.firstArrival,
      todayData: todayData?.firstArrival,
    });
    return arrival;
  };

  return {
    isWorking,
    isPaused,
    currentClocking,
    elapsedWorkTime,
    elapsedBreakTime,
    loading,
    pauseHistory,
    sessionStartTime,
    previousWorkTime,
    previousBreakTime,
    todayData,
    startWork,
    pauseWork,
    resumeWork,
    stopWork,
    formatDisplayTime,
    getCurrentBreakTime,
    getTotalWorkTimeWithPrevious,
    getTotalBreakTimeWithPrevious,
    hasTodayData,
    getFirstArrival,
  };
};
