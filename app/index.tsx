import React from "react";
import { Text, TextInput, View } from "react-native";
import './global.css';


export default function Index() {
  return (
    <View  className="bg-slate-700 rounded-xl"
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-yellow-500 text-3xl font-bold">Edit app/index.tsx to edit this screen.</Text>
      <TextInput style={{ width: 200, height: 40, borderWidth: 1 }} className="rounded-lg bg-red-600"/>
      
    </View>
  );
}
