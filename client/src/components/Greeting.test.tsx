import { render, screen } from "@testing-library/react";
import Greeting from "./Greeting";

describe("Greeting", () => {
	it("renders the title", () => {
		render(<Greeting title="Hello World" />);
		expect(screen.getByTestId("greeting")).toHaveTextContent("Hello World");
	});
});
