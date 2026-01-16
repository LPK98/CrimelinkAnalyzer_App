import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Duty" />
      <Tabs.Screen name="FaceDetection" />
      <Tabs.Screen name="Plate" />
      <Tabs.Screen name="Weapon" />
    </Tabs>
  );
}
