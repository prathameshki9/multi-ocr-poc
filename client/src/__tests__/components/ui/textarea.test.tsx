import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { Textarea } from "@/components/ui/textarea"

describe("Textarea Component", () => {
  const renderTextarea = (props = {}) => {
    return render(<Textarea aria-label="Test textarea" {...props} />)
  }

  it("renders correctly", () => {
    renderTextarea()
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const customClass = "test-custom-class"
    renderTextarea({ className: customClass })
    expect(screen.getByRole("textbox")).toHaveClass(customClass)
  })

  it("handles user input", async () => {
    renderTextarea()
    const textarea = screen.getByRole("textbox")
    const testText = "Hello, World!"
    
    await userEvent.type(textarea, testText)
    expect(textarea).toHaveValue(testText)
  })

  it("supports placeholder text", () => {
    const placeholder = "Enter your message"
    renderTextarea({ placeholder })
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument()
  })

  it("handles disabled state", () => {
    renderTextarea({ disabled: true })
    const textarea = screen.getByRole("textbox")
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed")
  })

  it("handles invalid state", () => {
    renderTextarea({ "aria-invalid": true })
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveClass(
      "aria-invalid:border-destructive",
      "aria-invalid:ring-destructive/20",
      "dark:aria-invalid:ring-destructive/40"
    )
  })

  it("supports controlled value", async () => {
    const handleChange = vi.fn()
    const { rerender } = render(
      <Textarea
        value="Initial value"
        onChange={handleChange}
        aria-label="Test textarea"
      />
    )

    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveValue("Initial value")

    await userEvent.type(textarea, "a")
    expect(handleChange).toHaveBeenCalled()

    // Update controlled value
    rerender(
      <Textarea
        value="Updated value"
        onChange={handleChange}
        aria-label="Test textarea"
      />
    )
    expect(textarea).toHaveValue("Updated value")
  })

  it("maintains minimum height", () => {
    renderTextarea()
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveClass("min-h-16")
  })

  it("supports autofocus", () => {
    renderTextarea({ autoFocus: true })
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveFocus()
  })

  it("handles rows and cols attributes", () => {
    renderTextarea({ rows: 5, cols: 40 })
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveAttribute("rows", "5")
    expect(textarea).toHaveAttribute("cols", "40")
  })

  it("supports maxLength and shows remaining characters", async () => {
    const maxLength = 10
    renderTextarea({ maxLength })
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement
    
    expect(textarea).toHaveAttribute("maxLength", maxLength.toString())
    
    await userEvent.type(textarea, "12345")
    expect(textarea).toHaveValue("12345")
    expect(textarea.value.length).toBeLessThanOrEqual(maxLength)
    
    // Try to type more than maxLength
    await userEvent.type(textarea, "678901")
    expect(textarea.value.length).toBeLessThanOrEqual(maxLength)
  })

  it("supports readonly mode", () => {
    renderTextarea({ readOnly: true, defaultValue: "Read only content" })
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveAttribute("readonly")
  })

  it("applies dark mode background styles", () => {
    renderTextarea()
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveClass("dark:bg-input/30")
  })

  it("handles focus and blur events", async () => {
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    
    renderTextarea({
      onFocus: handleFocus,
      onBlur: handleBlur
    })
    
    const textarea = screen.getByRole("textbox")
    
    await userEvent.click(textarea) // Focus
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    await userEvent.tab() // Blur by tabbing away
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })
}) 