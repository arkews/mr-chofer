import { signOut } from "@base/auth";
import { MaterialIcons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView
} from "@react-navigation/drawer";
import { useMutation } from "@tanstack/react-query";
import { styled } from "nativewind";
import { FC } from "react";
import {
  Linking,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import Svg, { Path } from "react-native-svg";
import colors from "tailwindcss/colors";
import Collapsible from "./collapsible";

const StyledIcon = styled(MaterialIcons);

type Props = DrawerContentComponentProps;

const CustomDrawer: FC<Props> = (props) => {
  const { mutate: mutateSignOut, isLoading: isLoadingSignOut } =
    useMutation(signOut);

  const performSupport = () => {
    Linking.openURL("https://wa.me/573157387465");
  };

  const goToFacebook = () => {
    Linking.openURL("https://www.facebook.com/profile.php?id=100088840662470");
  };

  const goToInstagram = () => {
    Linking.openURL("https://www.instagram.com/mrchoffer/");
  };

  const openLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      return;
    }

    await Linking.openURL(url);
  };

  const scheme = useColorScheme();

  return (
    <View className="flex flex-1 px-2">
      <DrawerContentScrollView {...props}>
        <View className="flex">
          <View>
            <View>
              <Text className="text-2xl text-center justify-center font-medium text-gray-500 dark:text-gray-400">
                MrChoffer
              </Text>
            </View>
          </View>
        </View>
      </DrawerContentScrollView>

      <View className="p-5">
        <View className="flex flex-row justify-center items-center space-x-7 px-3 py-2 rounded-lg active:bg-gray-50">
          <TouchableOpacity onPress={goToFacebook}>
            <Svg
              width={24}
              height={24}
              viewBox="0 0 256 256"
              preserveAspectRatio="xMidYMid"
              {...props}
            >
              <Path
                d="M256 128C256 57.308 198.692 0 128 0 57.308 0 0 57.307 0 128c0 63.888 46.808 116.843 108 126.445V165H75.5v-37H108V99.8c0-32.08 19.11-49.8 48.347-49.8C170.352 50 185 52.5 185 52.5V84h-16.14C152.958 84 148 93.867 148 103.99V128h35.5l-5.675 37H148v89.445c61.192-9.602 108-62.556 108-126.445"
                fill={scheme === "dark" ? colors.gray[400] : colors.gray[500]}
              />
              <Path
                d="m177.825 165 5.675-37H148v-24.01C148 93.866 152.959 84 168.86 84H185V52.5S170.352 50 156.347 50C127.11 50 108 67.72 108 99.8V128H75.5v37H108v89.445A128.959 128.959 0 0 0 128 256c6.804 0 13.483-.532 20-1.555V165h29.825"
                fill={scheme === "dark" ? colors.gray[900] : colors.gray[50]}
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity onPress={goToInstagram}>
            <Svg
              width={24}
              height={24}
              viewBox="0 0 256 256"
              preserveAspectRatio="xMidYMid"
              {...props}
            >
              <Path
                d="M128 23.064c34.177 0 38.225.13 51.722.745 12.48.57 19.258 2.655 23.769 4.408 5.974 2.322 10.238 5.096 14.717 9.575 4.48 4.479 7.253 8.743 9.575 14.717 1.753 4.511 3.838 11.289 4.408 23.768.615 13.498.745 17.546.745 51.723 0 34.178-.13 38.226-.745 51.723-.57 12.48-2.655 19.257-4.408 23.768-2.322 5.974-5.096 10.239-9.575 14.718-4.479 4.479-8.743 7.253-14.717 9.574-4.511 1.753-11.289 3.839-23.769 4.408-13.495.616-17.543.746-51.722.746-34.18 0-38.228-.13-51.723-.746-12.48-.57-19.257-2.655-23.768-4.408-5.974-2.321-10.239-5.095-14.718-9.574-4.479-4.48-7.253-8.744-9.574-14.718-1.753-4.51-3.839-11.288-4.408-23.768-.616-13.497-.746-17.545-.746-51.723 0-34.177.13-38.225.746-51.722.57-12.48 2.655-19.258 4.408-23.769 2.321-5.974 5.095-10.238 9.574-14.717 4.48-4.48 8.744-7.253 14.718-9.575 4.51-1.753 11.288-3.838 23.768-4.408 13.497-.615 17.545-.745 51.723-.745M128 0C93.237 0 88.878.147 75.226.77c-13.625.622-22.93 2.786-31.071 5.95-8.418 3.271-15.556 7.648-22.672 14.764C14.367 28.6 9.991 35.738 6.72 44.155 3.555 52.297 1.392 61.602.77 75.226.147 88.878 0 93.237 0 128c0 34.763.147 39.122.77 52.774.622 13.625 2.785 22.93 5.95 31.071 3.27 8.417 7.647 15.556 14.763 22.672 7.116 7.116 14.254 11.492 22.672 14.763 8.142 3.165 17.446 5.328 31.07 5.95 13.653.623 18.012.77 52.775.77s39.122-.147 52.774-.77c13.624-.622 22.929-2.785 31.07-5.95 8.418-3.27 15.556-7.647 22.672-14.763 7.116-7.116 11.493-14.254 14.764-22.672 3.164-8.142 5.328-17.446 5.95-31.07.623-13.653.77-18.012.77-52.775s-.147-39.122-.77-52.774c-.622-13.624-2.786-22.929-5.95-31.07-3.271-8.418-7.648-15.556-14.764-22.672C227.4 14.368 220.262 9.99 211.845 6.72c-8.142-3.164-17.447-5.328-31.071-5.95C167.122.147 162.763 0 128 0Zm0 62.27C91.698 62.27 62.27 91.7 62.27 128c0 36.302 29.428 65.73 65.73 65.73 36.301 0 65.73-29.428 65.73-65.73 0-36.301-29.429-65.73-65.73-65.73Zm0 108.397c-23.564 0-42.667-19.103-42.667-42.667S104.436 85.333 128 85.333s42.667 19.103 42.667 42.667-19.103 42.667-42.667 42.667Zm83.686-110.994c0 8.484-6.876 15.36-15.36 15.36-8.483 0-15.36-6.876-15.36-15.36 0-8.483 6.877-15.36 15.36-15.36 8.484 0 15.36 6.877 15.36 15.36Z"
                fill={scheme === "dark" ? colors.gray[400] : colors.gray[500]}
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-5 border-t border-t-gray-300 dark:border-t-gray-600">
        <Collapsible title="Legal">
          <Text
            onPress={() => openLink(process.env.TERMS_AND_CONDITIONS_URL ?? "")}
            className="font-medium text-gray-500 dark:text-gray-400"
          >
            Términos y condiciones generales
          </Text>
          <Text
            onPress={() => openLink(process.env.SPECIAL_TERMS_URL ?? "")}
            className="font-medium text-gray-500 dark:text-gray-400"
          >
            Términos y condiciones particulares
          </Text>
          <Text
            onPress={() => openLink(process.env.PRIVACY_POLICY_URL ?? "")}
            className="font-medium text-gray-500 dark:text-gray-400"
          >
            Política de privacidad
          </Text>
        </Collapsible>
      </View>

      <View className="p-5 border-t border-t-gray-300 dark:border-t-gray-600">
        <TouchableOpacity
          className="flex flex-row justify-center items-center space-x-2 px-3 py-2 rounded-lg active:bg-gray-50"
          onPress={performSupport}
        >
          <StyledIcon
            name="help"
            className="text-2xl text-gray-500 dark:text-gray-400"
          />
          <Text className="text-base text-center justify-center font-medium text-gray-500 dark:text-gray-400">
            Chat cental
          </Text>
        </TouchableOpacity>
      </View>

      <View className="p-5 border-t border-t-gray-300 dark:border-t-gray-600">
        <TouchableOpacity
          className="flex flex-row justify-center items-center space-x-2 px-3 py-2 border border-red-700 rounded-lg dark:border-red-500 active:border-red-900 dark:active:border-red-700"
          onPress={() => {
            props.navigation.closeDrawer();
            mutateSignOut();
          }}
          disabled={isLoadingSignOut}
        >
          <StyledIcon
            name="logout"
            className="text-2xl text-red-700 dark:text-red-500"
          />
          <Text className="text-base font-bold text-center text-red-700 dark:text-red-500">
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDrawer;
