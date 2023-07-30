import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, KeyboardAvoidingView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, Entypo } from '@expo/vector-icons';
import colors from '../colors';
import { signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';
import axios from "axios";

const API_KEY = "12ac30a3";

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showSearchField, setShowSearchField] = useState(false);
  const navigation = useNavigation();

  const onSignOut = () => {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={toggleSearchMode}
          style={{ marginLeft: 15 }}
        >
          <FontAwesome name={showSearchField ? "times" : "search"} size={24} color={colors.gray} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Favorites')}
            style={styles.headerButton}
          >
            <FontAwesome name="heart" size={24} color={colors.gray} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('About')}
            style={styles.headerButton}
          >
            <Entypo name="info-circle" size={24} color={colors.gray} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={onSignOut}
          >
            <FontAwesome name="sign-out" size={24} color={colors.gray} style={{ marginRight: 10 }} />
          </TouchableOpacity>
        </View>
      )
    });
    fetchTopMovies();
  }, [navigation, showSearchField]);

  const fetchTopMovies = async () => {
    try {
      const response = await axios.get(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=movie&type=movie&r=json&page=1`
      );
      console.log("Top Movies Response:", response.data);
      setTopMovies(response.data.Search || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${searchQuery}&type=movie&r=json&page=1`
      );
      console.log("Search Response:", response.data);
      setSearchResults(response.data.Search || []);
      setShowSearchField(false);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSearchMode = () => {
    setShowSearchField((prevMode) => !prevMode);
    setIsSearchMode(false);
    setSearchQuery("");
  };

  const addFavoriteContent = async (content) => {
    try {
      const userId = auth.currentUser.uid;
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      const existingFavorites = userSnapshot.exists() ? userSnapshot.data().favorites : [];
      const favoritesArray = Array.isArray(existingFavorites) ? existingFavorites : [];
      const isContentInFavorites = favoritesArray.some(item => item.imdbID === content.imdbID);
      if (!isContentInFavorites) {
        const updatedFavorites = [...favoritesArray, content];
        await updateDoc(userRef, { favorites: updatedFavorites });
        console.log(`${content.Title} added to favorites.`);
      } else {
        console.log(`${content.Title} is already in favorites.`);
      }
    } catch (error) {
      console.log('Error adding content to favorites:', error);
    }
  };

  const handleMoviePress = (item) => {
    addFavoriteContent(item);
  };

  const renderMovieItem = ({ item }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => handleMoviePress(item)}
    >
      <Image source={{ uri: item.Poster }} style={styles.moviePoster} />
      <View style={styles.movieDetails}>
        <Text style={styles.movieTitle}>{item.Title}</Text>
        <Text style={styles.movieYear}>{item.Year}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>OMDB</Text>
        {showSearchField && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search a movie or serie..."
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        )}
        {searchResults?.length > 0 ? (
          <FlatList
            horizontal
            data={searchResults}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.imdbID}
            contentContainerStyle={styles.movieListContainer}
          />
        ) : (
          <FlatList
            horizontal
            data={topMovies}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.imdbID}
            contentContainerStyle={styles.movieListContainer}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  heading: {
    fontSize: 36,
    fontWeight: "bold",
    color: "red",
    marginBottom: 16,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginHorizontal: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 58,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: "red",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  movieListContainer: {
    paddingBottom: 8,
  },
  movieItem: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    width: 130,
    height: 350,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 8,
  },
  moviePoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  movieDetails: {
    marginTop: 8,
    alignItems: "center",
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  movieYear: {
    color: "gray",
  },
});

export default HomeScreen;
