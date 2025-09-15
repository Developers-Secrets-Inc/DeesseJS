import { ThemeProvider } from "./theme-provider"
import { RootProvider } from 'fumadocs-ui/provider';


export const AppProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <RootProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </RootProvider>
    )
}