module.exports = {
  root: true,
  extends: [
    "@react-native",
    "@react-native-community",
    "plugin:prettier/recommended"
  ],
  rules: {
    quotes: ["error", "double"], // Luôn dùng double quotes
    "prettier/prettier": [
      "error",
      {
        singleQuote: false, // Prettier dùng double quotes
        semi: true, // Có dấu chấm phẩy
        trailingComma: "all", // Dấu phẩy cuối object/array
        printWidth: 120, // Giới hạn độ dài dòng
      }
    ]
  }
};
