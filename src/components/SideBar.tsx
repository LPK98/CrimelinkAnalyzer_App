import { Href, router, usePathname } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../theme/ThemeProvider";

type MenuStatus = "active" | "placeholder";

type SideBarItem = {
  key: string;
  label: string;
  iconName: React.ComponentProps<typeof MaterialIcons>["name"];
  route?: Href;
  status: MenuStatus;
  helperText?: string;
};

const SideBar = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems: SideBarItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      route: "/Dashboard",
      iconName: "dashboard",
      status: "active",
    },
    {
      key: "contact-us",
      label: "Contact Us",
      iconName: "contact-support",
      status: "active",
      route: "/ContactUs",
    },
    {
      key: "translate",
      label: "Translate",
      iconName: "translate",
      status: "placeholder",
      helperText: "Language tools are coming soon.",
    },
    {
      key: "faq",
      label: "FAQ",
      iconName: "help",
      status: "active",
      route: "/FAQ",
    },
    {
      key: "settings",
      label: "Settings",
      route: "/Settings",
      iconName: "settings",
      status: "active",
    },
  ];

  const handleMenuPress = (item: SideBarItem) => {
    // if (item.status === "placeholder") {
    //   Alert.alert(
    //     "Coming soon",
    //     item.helperText ?? "This feature is not ready yet.",
    //   );
    //   return;
    // }    //REMOVE

    if (item.route) {
      if (pathname !== item.route) {
        router.push(item.route);
      }
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        paddingHorizontal: 30,
        paddingTop: 30,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          paddingHorizontal: 12,
          paddingVertical: 12,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: 17,
              fontWeight: "bold",
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
            {`Welcome ${user?.name || "User"}`}
          </Text>
          <Text style={{ color: colors.sidebarItemMutedText, fontSize: 12 }}>
            Criminal Link Analyzer
          </Text>
        </View>
      </View>

      <Text
        style={{
          color: colors.sidebarItemMutedText,
          fontSize: 12,
          fontWeight: "600",
          marginHorizontal: 10,
          marginBottom: 12,
        }}
      >
        NAVIGATION
      </Text>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const isActive = !!item.route && pathname === item.route;
          const isPlaceholder = item.status === "placeholder";

          return (
            <Pressable
              key={item.key}
              onPress={() => handleMenuPress(item)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 10,
                marginVertical: 4,
                borderWidth: isActive ? 1 : 0,
                borderColor: isActive ? colors.primaryAccent : "transparent",
                backgroundColor: isActive
                  ? colors.sidebarItemActiveBg
                  : pressed
                    ? colors.sidebarItemPressedBg
                    : "transparent",
                opacity: isPlaceholder ? 0.8 : 1,
              })}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.sidebarItemIconBg,
                  }}
                >
                  <MaterialIcons
                    name={item.iconName}
                    color={isActive ? colors.primary : colors.text}
                    size={20}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: isPlaceholder
                        ? colors.sidebarItemMutedText
                        : colors.text,
                      fontWeight: isActive ? "700" : "500",
                      fontSize: 15,
                    }}
                  >
                    {item.label}
                  </Text>
                  {isPlaceholder ? (
                    <Text
                      style={{
                        color: colors.sidebarItemMutedText,
                        fontSize: 11,
                      }}
                    >
                      Coming soon
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={logout}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          borderRadius: 12,
          paddingHorizontal: 10,
          paddingVertical: 12,
          marginTop: 8,
          marginBottom: 18,
          backgroundColor: pressed
            ? colors.sidebarItemPressedBg
            : "transparent",
        })}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.sidebarItemIconBg,
            }}
          >
            <MaterialIcons name="logout" color={colors.danger} size={20} />
          </View>
          <Text
            style={{ color: colors.danger, fontWeight: "600", fontSize: 15 }}
          >
            Logout
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

export default SideBar;
