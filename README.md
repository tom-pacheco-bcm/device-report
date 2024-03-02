# device-report

## Overview

HTML Device report of SpaceLogic MP, RP, and IP-IO series controllers for Schneider Electrics EcoStruxure Building Operation WebClient.

## Installation

Load into a html utility object in a Server with the BACnet Interface to run the report on. 

## Operation

On opening it will 
* scan the local server for BACnet interface in the root path of the server. 
* will scan the interface for IP Networks 
* search each network for SpaceLogic Controllers (MP, RP,  and IP)
* read the device report file
* generate a report table with information like
  * RSTP Status
  * Hardware MAC Address






