import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Button, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, Entypo } from '@expo/vector-icons';
import colors from '../colors';
import { signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favoritesData, setFavoritesData] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const onSignOut = () => {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <FontAwesome name="heart" size={24} color={colors.gray} />
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.headerButton}
          >
            <FontAwesome name="home" size={24} color={colors.gray} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('About')}
            style={styles.headerButton}
          >
            <Entypo name="info-circle" size={24} color={colors.gray} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onSignOut}
          >
            <FontAwesome name="sign-out" size={24} color={colors.gray} style={{ marginRight: 10 }} />
          </TouchableOpacity>
        </View>
      )
    });

    fetchUserData();
  }, [navigation]);

  const fetchUserData = async () => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setFavoritesData(userData.favorites || []);
      }
    }
  };

  const handleContentPress = (content) => {
    setSelectedContent(content);
    setShowModal(true);
  };

  const handleRemoveContent = async (content) => {
    try {
      const updatedFavorites = favoritesData.filter(item => item.imdbID !== content.imdbID);
      const userId = auth.currentUser.uid;
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, { favorites: updatedFavorites });
      setFavoritesData(updatedFavorites);
    } catch (error) {
      console.log(error);
    }
  };

  const renderContentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contentItemContainer}
      onPress={() => handleContentPress(item)}
    >
      <Image source={{ uri: item.Poster }} style={styles.contentPoster} />
      <View style={styles.contentDetails}>
        <Text style={styles.contentTitle}>{item.Title}</Text>
        <Text style={styles.contentYear}>{item.Year}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveContent(item)}>
        <FontAwesome name="trash" size={24} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.categoryContainer}>
          <Text style={styles.title}>Movies and Series</Text>
          <View style={styles.contentRow}>
            <FlatList
              horizontal
              data={favoritesData.filter(item => item.Type === "movie")}
              renderItem={renderContentItem}
              keyExtractor={(item) => item.imdbID}
              contentContainerStyle={styles.contentListContainer}
            />
          </View>
        </View>
      </ScrollView>
      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          {selectedContent && (
            <>
              <Image source={{ uri: selectedContent.Poster }} style={styles.modalPoster} />
              <Text style={styles.modalTitle}>{selectedContent.Title}</Text>
              <Text>Director: {selectedContent.Director}</Text>
              <Text>Main Actors: {selectedContent.Actors}</Text>
              <Text>Country: {selectedContent.Country}</Text>
              <Text>Year: {selectedContent.Year}</Text>
            </>
          )}
          <Button title="Close" onPress={() => setShowModal(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "red",
    paddingBottom: 24,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginHorizontal: 8,
  },
  categoryContainer: {
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentItemContainer: {
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
  contentPoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  contentDetails: {
    marginTop: 8,
    alignItems: "center",
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalPoster: {
    width: 200,
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contentListContainer: {
    paddingBottom: 8,
  },
  contentYear: {
    color: "gray",
  },
});

export default FavoritesScreen;
