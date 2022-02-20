/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

jest.mock("../app/store", () => mockStore);

let newBill;
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      beforeEach(() => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        }); // Set localStorage
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        ); // Set user as Employee in localStorage

        const html = NewBillUI();
        document.body.innerHTML = html;
        newBill = new NewBill({
          document,
          onNavigate: (pathname) =>
            (document.body.innerHTML = ROUTES({ pathname })),
          firestore: null,
          localStorage: window.localStorage,
        });
      });
    });
  });

  /**
   * On change
   */
  describe("When I select a file", () => {
    test("Then it should be changed in the input", () => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["myProof.png"], "myProof.png", { type: "image/png" }),
          ],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0].name).toBe("myProof.png");
    });
  });

  /**
   * Proof
   */
  describe("When I add a file in the proof input", () => {
    test("Then only files with .png, .jpg and .jpeg should be accepted", () => {
      const errMessage = screen.getByTestId("fileInput-error-message");
      let testFile;

      const inputFile = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      inputFile.addEventListener("change", handleChangeFile);

      // png
      testFile = new File(["()"], "test.png", { type: "image/png" });
      fireEvent.change(inputFile, { target: { files: [testFile] } });
      userEvent.upload(inputFile, testFile);
      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0]).toStrictEqual(testFile);
      expect(errMessage.classList.length).toEqual(2);
      expect(errMessage.classList[1]).toEqual("fileInput-error-message--hide");

      // jpg
      testFile = new File(["()"], "test.jpg", { type: "image/jpg" });
      fireEvent.change(inputFile, { target: { files: [testFile] } });
      userEvent.upload(inputFile, testFile);
      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0]).toStrictEqual(testFile);
      expect(errMessage.classList.length).toEqual(2);
      expect(errMessage.classList[1]).toEqual("fileInput-error-message--hide");

      // jpeg
      testFile = new File(["()"], "test.jpeg", { type: "image/jpeg" });
      fireEvent.change(inputFile, { target: { files: [testFile] } });
      userEvent.upload(inputFile, testFile);
      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0]).toStrictEqual(testFile);
      expect(errMessage.classList.length).toEqual(2);
      expect(errMessage.classList[1]).toEqual("fileInput-error-message--hide");

      // error
      testFile = new File(["()"], "test.gif", { type: "image/gif" });
      fireEvent.change(inputFile, { target: { files: [testFile] } });
      userEvent.upload(inputFile, testFile);
      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0]).toStrictEqual(testFile);
      expect(errMessage.classList.length).toEqual(1);
    });
  });
  /**
   * On submit
   */
  describe("When I submit the form", () => {
    test("It should create a new bill", () => {
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const newBillform = screen.getByTestId("form-new-bill");
      newBillform.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillform);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

// GET integration test

describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const contentNewBills = await screen.getAllByText("Type de dépense");
      expect(contentNewBills).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
    });
  });
});
