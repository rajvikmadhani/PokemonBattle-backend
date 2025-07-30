import { createContext, useState, useContext, useEffect } from 'react';
import {
  fetchUser,
  fetchUserRoster,
  fetchUserScore,
  addPokemonToUserRoster,
  removePokemonFromUserRoster,
  resetUserRoster,
} from '../utils/databaseAPI.js';

const PokemonContext = createContext();

export const usePokemon = () => useContext(PokemonContext);

export const PokemonProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User data
  const [roster, setRoster] = useState([]); // Pokémon in roster
  const [score, setScore] = useState(0); // User Score
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const userId = '123'; // TODO: Set dynamically when login is available

  // Fetch User Data (User, Roster, Score)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await fetchUser(userId);
        setUser(userData);

        const userRoster = await fetchUserRoster(userId);
        setRoster(userRoster);

        const userScore = await fetchUserScore(userId);
        setScore(userScore);

        console.log('Successfully fetched user, roster, and score.');
      } catch (err) {
        setError('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Add Pokémon to Roster (DB & State)
  const addPokemonToRoster = async pokemon => {
    if (roster.length >= 6) {
      setLimitReached(true);
      return false;
    }

    try {
      console.log('Adding pokemon with ID:', pokemon.id);
      await addPokemonToUserRoster(userId, pokemon.id);
      setRoster(prev => [...prev, pokemon]);
      setLimitReached(false);
      return true;
    } catch (error) {
      console.error('Failed to add Pokémon to roster.', error);
      return false;
    }
  };

  // Remove Pokémon from Roster
  const removePokemonFromRoster = async pokemonId => {
    try {
      await removePokemonFromUserRoster(userId, pokemonId);
      setRoster(prev => prev.filter(p => p.id !== pokemonId));
      setLimitReached(false);
      console.log(`Pokémon ID ${pokemonId} removed from roster.`);
    } catch (error) {
      console.error('Failed to remove Pokémon.');
    }
  };

  // Reset Roster
  const resetRoster = async () => {
    try {
      await resetUserRoster(userId);
      setRoster([]);
      setLimitReached(false);
      console.log('Roster has been reset.');
    } catch (error) {
      console.error('Failed to reset roster.');
    }
  };

  return (
    <PokemonContext.Provider
      value={{
        user,
        roster,
        score,
        addPokemonToRoster,
        removePokemonFromRoster,
        resetRoster,
        limitReached,
        loading,
        error,
      }}
    >
      {children}
    </PokemonContext.Provider>
  );
};
