import {IS_LOCAL, LOCAL_PATH} from "@/constants";

export const fetchInputData = async () => {
  if (IS_LOCAL) {
    return await fetch(LOCAL_PATH)
        .then((response) => response.json())
  } else {
    try {
      return JSON.parse(
          JSON.stringify(window?.calculatorOptions)
      )
    } catch (e) {
      console.error(
          "Не удалось получить настройки для калькулятора" + e.message
      );
    }
  }
}
