import { render, screen } from '@testing-library/react'
import Hero from '../src/components/Hero'
import '@testing-library/jest-dom'

describe('Hero', () => {
    it('renders the main heading', () => {
        render(<Hero />)
        const heading = screen.getByText(/AIAA -/i)
        const subHeading = screen.getByText(/Zewail City/i)
        expect(heading).toBeInTheDocument()
        expect(subHeading).toBeInTheDocument()
    })
})