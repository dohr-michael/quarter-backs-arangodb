package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)


var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Show version",
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Printf("Version:  %s\n", viper.GetString("build.version"))
		fmt.Printf("Revision: %s\n", viper.GetString("build.revision"))
		fmt.Printf("Time:     %s\n", viper.GetString("build.time"))
		return nil
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}