import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onHandleSignup = () => {
    if (firstName !== "" && lastName !== "" && age !== "" && email !== "" && password !== "") {
      if (!email.includes("@")) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Weak Password", "Password should be at least 6 characters long.");
        return;
      }
      if (parseInt(age) < 18) {
        Alert.alert("Age Restriction", "You must be at least 18 years old to register.");
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          saveUserDataToFirestore(user.uid);
          console.log('Signup success');
        })
        .catch((err) => Alert.alert("Signup error", err.message));
    } else {
      Alert.alert("Missing Fields", "Please fill in all the required fields.");
    }
  };

  const saveUserDataToFirestore = async (userId) => {
    const userRef = doc(collection(database, 'users'), userId);
    try {
      await setDoc(userRef, {
        firstName,
        lastName,
        age: age,
        email
      });
      console.log('User data saved to Firestore');
    } catch (error) {
      console.error('Error saving user data to Firestore:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          autoCapitalize="none"
          keyboardType="first-name"
          textContentType="firstName"
          autoFocus={true}
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          autoCapitalize="none"
          keyboardType="last-name"
          textContentType="lastName"
          autoFocus={true}
          value={lastName}
          onChangeText={(text) => setLastName(text)}
        />
        <Picker
          selectedValue={age}
          onValueChange={setAge}
          style={styles.input}
        >
          <Picker.Item label="Select Age" value="" />
          {Array.from({ length: 121 }, (_, index) => (
            <Picker.Item key={index.toString()} label={index.toString()} value={index.toString()} />
          ))}
        </Picker>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoFocus={true}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
          <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}> Sign Up</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
          <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Have an account?</Text>
        </View>
        <TouchableOpacity style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }} onPress={() => navigation.navigate("Login")}>
          <Text style={{ color: '#ff0000', fontWeight: '600', fontSize: 14 }}> Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "red",
    alignSelf: "center",
    paddingBottom: 24,
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  whiteSheet: {
    width: '100%',
    height: '75%',
    position: "absolute",
    bottom: 0,
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: 'red',
    height: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
});
