import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { File, Paths } from "expo-file-system";

export type PlantType = {
  id: string;
  name: string;
  wateringFrequencyDays: number;
  lastWateredAtTimestamp?: number;
  imageUri?: string | undefined;
};

type PlantsState = {
  nextId: number;
  plants: PlantType[];
  addPlant: (
    name: string,
    wateringFrequencyDays: number,
    imageUri?: string,
  ) => Promise<unknown>;
  removePlant: (plantId: string) => void;
  waterPlant: (plantId: string) => void;
};

// Just a learning note, the ...state we spread each time is redundant in zustand
// The reason we do it however is because we need a new state reference each time
// to indicate something has changed
export const usePlantStore = create(
  persist<PlantsState>(
    (set) => ({
      plants: [],
      nextId: 1,
      addPlant: async (
        name: string,
        wateringFrequencyDays: number,
        imageUri?: string | undefined,
      ) => {
        const fileName = `${new Date().getTime()}-${imageUri?.split("/").slice(-1)[0]}`;
        const destinationFile = new File(Paths.document, fileName);
        const savedImageUri = destinationFile.uri;

        if (imageUri) {
          const sourceFile = new File(imageUri);
          await sourceFile.copy(destinationFile);
        }
        return set((state) => {
          return {
            ...state,
            nextId: state.nextId + 1,
            plants: [
              {
                id: String(state.nextId),
                name,
                wateringFrequencyDays,
                imageUri: imageUri ? savedImageUri : undefined,
              },
              ...state.plants,
            ],
          };
        });
      },
      removePlant: (plantId: string) => {
        return set((state) => {
          return {
            ...state,
            plants: state.plants.filter((plant) => plant.id !== plantId),
          };
        });
      },
      waterPlant: (plantId: string) => {
        return set((state) => {
          return {
            ...state,
            plants: state.plants.map((plant) => {
              if (plant.id === plantId) {
                return {
                  ...plant,
                  lastWateredAtTimestamp: Date.now(),
                };
              }
              return plant;
            }),
          };
        });
      },
    }),
    {
      name: "plantly-plants-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
