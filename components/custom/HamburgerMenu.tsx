import React, { useContext } from "react";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { Button } from "@/components/ui/button";
import {
  Icon,
  MenuIcon,
  SunIcon,
  MoonIcon,
  ExternalLinkIcon,
} from "@/components/ui/icon";
import { ColorModeContext } from "@/app/_layout";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";

interface HamburgerMenuProps {
  colorMode: "light" | "dark";
  handleColorMode: () => void;
}

export function HamburgerMenu() {
  const { colorMode, handleColorMode } = useContext(ColorModeContext) as {
    colorMode: "light" | "dark";
    handleColorMode: () => void;
  };

  // Function to handle signing out
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign Out Error", error.message);
    }
    // If successful, the onAuthStateChange listener in _layout.tsx
    // will detect the change and navigate the user to the auth screen.
  }

  return (
    <Menu
      placement="bottom right"
      offset={5}
      trigger={({ ...triggerProps }) => {
        return (
          <Button variant="link" size="sm" {...triggerProps}>
            <Icon as={MenuIcon} size="lg" className="text-typography-900" />
          </Button>
        );
      }}
    >
      <MenuItem key="theme" textValue="Toggle Theme" onPress={handleColorMode}>
        <Icon
          as={colorMode === "light" ? SunIcon : MoonIcon}
          size="sm"
          className="mr-2"
        />
        <MenuItemLabel size="sm">
          {colorMode === "light" ? "Light Mode" : "Dark Mode"}
        </MenuItemLabel>
      </MenuItem>

      <MenuItem key="signout" textValue="Sign Out" onPress={handleSignOut}>
        <Icon as={ExternalLinkIcon} size="sm" className="mr-2" />
        <MenuItemLabel size="sm">Sign Out</MenuItemLabel>
      </MenuItem>
    </Menu>
  );
}
