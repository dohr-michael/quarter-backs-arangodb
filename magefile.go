// +build mage

package main

import "github.com/magefile/mage/sh"

func init() {

}

func Test() error {
	return sh.Run("go", "test", "./...")
}

func Build() error {
	return sh.Run("go", "build", "./...")
}

/*
func Release() error {
	return sh.Run("goreleaser", "release")
}
*/
