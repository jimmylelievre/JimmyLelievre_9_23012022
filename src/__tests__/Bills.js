/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes";
import store from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;
      //to-do write expect expression
    });
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills }, { formatDate: false });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  // Loading

  describe("When it is loading", () => {
    test("Then i should see Loading page", () => {
      const html = BillsUI({ loading: true });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });

  // Error

  describe("When data cannot be loaded", () => {
    test("Then i should see error page", () => {
      const html = BillsUI({ error: "some error message" });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });

  // Init bills

  let billsList;
  describe("When I click on", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      }); // Set localStorage
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" })); // Set user as Employee in localStorage
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      $.fn.modal = jest.fn(); // Prevent jQuery error
      billsList = new Bills({
        document,
        onNavigate: (pathname) =>
          (document.body.innerHTML = ROUTES({ pathname })),
        Store: null,
        localStorage: window.localStorage,
      });
    });
  });

  // Test modal open

  describe("When i click on the icon eye", () => {
    test("Then i should see a modal open", () => {
      billsList = new Bills({
        document,
        onNavigate: (pathname) =>
          (document.body.innerHTML = ROUTES({ pathname })),
        Store: null,
        localStorage: window.localStorage,
      });
      const eye = screen.queryByTestId("icon-eye");
      const handleClickIconEye = jest.fn(billsList.handleClickIconEye(eye));
      eye.addEventListener("click", handleClickIconEye);
      fireEvent.click(eye);
      expect(handleClickIconEye).toHaveBeenCalled();
      expect(screen.queryByTestId("modaleFile")).toBeTruthy();
    });
  });

  // Test new bill button

  describe("the New Bill button", () => {
    test("Then it should display the New Bill Page", () => {
      const handleClickNewBill = jest.fn(billsList.handleClickNewBill);
      const buttonNewBill = screen.queryByTestId("btn-new-bill");
      expect(buttonNewBill).toBeTruthy();
      buttonNewBill.addEventListener("click", handleClickNewBill);
      fireEvent.click(buttonNewBill);
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  // GET integration test

  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(store, "get");
      const userBills = await store.get();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(userBills.data.length).toBe(4);
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
