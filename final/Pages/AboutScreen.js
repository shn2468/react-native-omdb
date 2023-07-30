import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, Entypo } from '@expo/vector-icons';
import colors from '../colors';
import { signOut } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore';
import { auth } from '../config/firebase';

const AboutScreen = () => {
    const navigation = useNavigation();
    const [userFirstName, setUserFirstName] = useState('');

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
    };

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <Entypo name="info-circle" size={24} color={colors.gray} />
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
                        onPress={() => navigation.navigate('Home')}
                        style={styles.headerButton}
                    >
                        <Entypo name="home" size={24} color={colors.gray} />
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

        const fetchUserData = async () => {
            if (auth.currentUser) {
                const userId = auth.currentUser.uid;
                const firestore = getFirestore();
                const userRef = doc(firestore, 'users', userId);
                const userSnapshot = await getDoc(userRef);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setUserFirstName(userData.firstName);
                }
            }
        };

        fetchUserData();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.centerContainer}>
                <Text style={styles.title}>שחר נשר</Text>
            </View>
            <View style={styles.centerContainer}>
                <Text style={styles.title}>snesher96@gmail.com</Text>
            </View>
            <View style={styles.centerContainer}>
                <Text style={styles.title}>הנדסאים תוכנה</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#f8f8f8",
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: "red",
        alignSelf: "center",
        paddingBottom: 24,
    },
    chatButton: {
        backgroundColor: colors.primary,
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: .9,
        shadowRadius: 8,
    },
    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        marginRight: 10,
    },
});

export default AboutScreen;
